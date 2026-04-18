"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight, User, Mail, Lock,
  AlertCircle, CheckCircle2, Leaf, LogIn, UserPlus
} from "lucide-react";
import { setSession, getSession, importGameDataFromServer } from "@/lib/authUtils";

// ─── Background floaters ─────────────────────────────────────────────────────
const EMOJIS = ["🌿", "🍄", "🦋", "🌸", "🦎", "🐠", "🌺", "🦜", "🌱", "🦁", "🐙", "🦚"];

function Background() {
  const [items] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      char: EMOJIS[i % EMOJIS.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${12 + Math.random() * 12}s`,
      size: `${16 + Math.random() * 14}px`,
    }))
  );

  return (
    <>
      {/* Radial glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-emerald-200/40 blur-[150px]" />
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-cyan-200/30 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-lime-200/30 blur-[80px]" />
      </div>

      {/* Floating species */}
      {items.map(item => (
        <div
          key={item.id}
          className="fixed pointer-events-none select-none"
          style={{
            left: item.left,
            fontSize: item.size,
            opacity: 0,
            animationName: "leaf-fall",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        >
          {item.char}
        </div>
      ))}
    </>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  icon, type, placeholder, value, onChange, rightSlot, autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-950/30 group-focus-within:text-emerald-500 transition-colors duration-200">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full bg-white border border-emerald-950/10 rounded-2xl py-4 pl-[3.25rem] pr-12 text-[15px] font-medium text-emerald-950 placeholder:text-emerald-950/30 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-sm"
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const count = checks.filter(Boolean).length;
  const levels = [
    { color: "bg-red-500", text: "Too short", textColor: "text-red-600" },
    { color: "bg-orange-500", text: "Weak", textColor: "text-orange-600" },
    { color: "bg-yellow-500", text: "Fair", textColor: "text-yellow-600" },
    { color: "bg-lime-500", text: "Good", textColor: "text-lime-600" },
    { color: "bg-emerald-500", text: "Strong", textColor: "text-emerald-600" },
  ];
  const level = levels[Math.min(count, 4)];

  return (
    <div className="space-y-1.5 px-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-emerald-950/5 overflow-hidden">
            <motion.div
              animate={{ width: i < count ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`h-full rounded-full ${level.color}`}
            />
          </div>
        ))}
      </div>
      <div className={`text-right text-xs font-bold font-mono ${level.textColor}`}>{level.text}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // If already logged in, go home
  useEffect(() => {
    if (getSession()) router.replace("/");
  }, [router]);

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (error) setError("");
  };

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation for sign up
    if (mode === "signup") {
      if (!form.username.trim() || form.username.trim().length < 3)
        return setError("Username must be at least 3 characters.");
      if (form.password.length < 6)
        return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirm)
        return setError("Passwords don't match — please try again.");
    }

    setLoading(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "signin"
        ? { email: form.email.trim(), password: form.password }
        : { username: form.username.trim(), email: form.email.trim(), password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Save session to localStorage
      setSession({ id: data.user.id, username: data.user.username, email: data.user.email });

      // On sign-in, sync server game data to localStorage
      if (mode === "signin" && data.user.gameData) {
        importGameDataFromServer(data.user.gameData);
      }

      setSuccessMsg(
        mode === "signin"
          ? `Welcome back, ${data.user.username}! Loading your collection... 🌿`
          : `Welcome to EcoGuesser, ${data.user.username}! Your journey begins now. 🌱`
      );

      setTimeout(() => router.push("/"), 1800);
    } catch {
      setError("Connection error — make sure the dev server is running.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden text-foreground">
      <Background />

      {/* Grid texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Outer glow ring */}
        <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-br from-emerald-500/40 via-cyan-500/20 to-emerald-500/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[31px] bg-white/90 backdrop-blur-3xl border border-white overflow-hidden shadow-2xl shadow-emerald-900/10"
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-[20%] right-[20%] h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

          <div className="p-8 pb-0 mt-2">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-emerald-50 border-2 border-emerald-100 mb-5 shadow-inner"
              >
                <span className="text-4xl shadow-sm">🌿</span>
              </motion.div>

              <h1 className="text-4xl font-black tracking-tight leading-none mb-3">
                <span className="text-gradient">Eco</span>
                <span className="text-emerald-950">Guesser</span>
              </h1>

              <AnimatePresence mode="wait">
                <motion.p
                  key={mode}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-emerald-950/60 font-medium text-[15px]"
                >
                  {mode === "signin"
                    ? "Welcome back — your species await"
                    : "Join and start discovering biodiversity"}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-emerald-950/5 rounded-[20px] p-1.5 mb-6 border border-emerald-950/5 shadow-inner">
              {(["signin", "signup"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-[15px] font-bold transition-all duration-300 ${
                    mode === m
                      ? "bg-white text-emerald-950 shadow-[0_2px_12px_rgba(0,0,0,0.06)] scale-[1.02]"
                      : "text-emerald-950/50 hover:text-emerald-950/80"
                  }`}
                >
                  {m === "signin"
                    ? <><LogIn className="w-4 h-4" /> Sign In</>
                    : <><UserPlus className="w-4 h-4" /> Sign Up</>
                  }
                </button>
              ))}
            </div>

            {/* Success message */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-emerald-800 font-bold text-[15px]">{successMsg}</span>
                  <div className="ml-auto w-4 h-4 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin flex-shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Username — sign up only */}
                {mode === "signup" && (
                  <Field
                    icon={<User />}
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={v => update("username", v)}
                    autoComplete="username"
                  />
                )}

                {/* Email */}
                <Field
                  icon={<Mail />}
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={v => update("email", v)}
                  autoComplete="email"
                />

                {/* Password */}
                <Field
                  icon={<Lock />}
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={v => update("password", v)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      tabIndex={-1}
                      className="text-emerald-950/30 hover:text-emerald-950/70 transition-colors bg-emerald-50 p-2 rounded-xl"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {/* Password strength (sign up only) */}
                {mode === "signup" && <PasswordStrength password={form.password} />}

                {/* Confirm password — sign up only */}
                {mode === "signup" && (
                  <Field
                    icon={<Lock />}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm password"
                    value={form.confirm}
                    onChange={v => update("confirm", v)}
                    autoComplete="new-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowConfirm(p => !p)}
                        tabIndex={-1}
                        className="text-emerald-950/30 hover:text-emerald-950/70 transition-colors bg-emerald-50 p-2 rounded-xl"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                     <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-3 text-red-700 text-[15px] font-medium bg-red-50 border border-red-200 rounded-2xl px-5 py-4"
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || !!successMsg}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden shimmer-btn mt-4 shadow-[0_5px_20px_-5px_rgba(16,185,129,0.5)]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{mode === "signin" ? "Signing in…" : "Creating account…"}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Switch mode */}
            <div className="mt-6 text-center space-y-3 pb-8">
              <p className="text-emerald-950/50 text-sm font-medium">
                {mode === "signin" ? "New to EcoGuesser?" : "Already have an account?"}{" "}
                <button
                  onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                  className="text-emerald-600 hover:text-emerald-500 font-bold transition-colors ml-1"
                >
                  {mode === "signin" ? "Create an account" : "Sign in instead"}
                </button>
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-emerald-950/5 bg-emerald-50/50 px-8 py-5 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-xs text-emerald-950/40 font-bold">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span className="font-mono">34 species</span>
            </div>
            <div className="text-xs text-emerald-950/40 font-bold font-mono">🔒 Local Storage</div>
            <div className="text-xs text-emerald-950/40 font-bold font-mono">No ads</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
