"use client";

import { signInAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const success = searchParams.get("success");
  const message: Message | undefined = err
    ? { error: err }
    : success
      ? { success: success }
      : undefined;

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#0A0A0A]">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay [background-image:url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

      <div className="relative z-10 flex flex-1 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl border border-[#333] bg-[#111]/80 p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute left-10 top-0 h-1 w-24 rounded-b-full bg-primary" />

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 font-dmsans text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Welcome Back
              </p>
              <h1 className="font-bebas text-6xl leading-none text-white">SIGN IN</h1>
            </div>
            <Link href="/" className="group flex items-center">
              <span className="font-bebas text-3xl text-gray-600 transition-colors group-hover:text-white">PLATZ</span>
            </Link>
          </div>

          <form className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label
                htmlFor="email"
                className="mb-2 block font-dmsans text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-12 rounded-xl border-[#333] bg-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label
                htmlFor="password"
                className="mb-2 block font-dmsans text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  minLength={8}
                  className="h-12 rounded-xl border-[#333] bg-[#1a1a1a] pr-12 text-white placeholder:text-gray-600 focus:border-primary focus:ring-primary"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                  <EyeOff size={18} />
                </div>
              </div>
            </motion.div>

            <div className="text-right">
              <Link href="/forgot-password" className="font-dmsans text-xs font-bold text-primary hover:text-white">
                Forgot password?
              </Link>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <SubmitButton
                pendingText="ACCESSING..."
                formAction={signInAction}
                className="w-full rounded-xl bg-primary py-6 font-bebas text-2xl text-black shadow-[0_0_20px_rgba(184,255,60,0.2)] transition-all hover:-translate-y-1 hover:bg-white"
              >
                SECURE LOGIN
              </SubmitButton>
            </motion.div>

            {message && <FormMessage message={message} />}
          </form>

          <p className="mt-8 text-center font-dmsans text-xs font-bold uppercase tracking-widest text-gray-500">
            No account?{" "}
            <Link href="/sign-up" className="text-primary transition-colors hover:text-white">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <SignInForm />
    </Suspense>
  );
}
