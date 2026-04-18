"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Leaf, Flame, BookOpen, Trophy, ChevronRight, LogIn, LogOut, User } from "lucide-react";
import { getStreakData, getCollection } from "@/lib/gameUtils";
import { getSession, clearSession, type Session } from "@/lib/authUtils";
import { useRouter } from "next/navigation";

const LEAF_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a3e635", "#86efac"];

function LeafParticles() {
  const [leaves] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      delay: `${Math.random() * 12}s`,
      duration: `${10 + Math.random() * 14}s`,
      size: `${6 + Math.random() * 8}px`,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map(l => (
        <div
          key={l.id}
          className="leaf-particle"
          style={{
            left: l.left,
            backgroundColor: l.color,
            width: l.size,
            height: l.size,
            animationDelay: l.delay,
            animationDuration: l.duration,
          }}
        />
      ))}
    </div>
  );
}

const HOW_TO_PLAY = [
  { emoji: "🌍", title: "Hint 1 — Habitat", desc: "A vague clue about the species' location and status." },
  { emoji: "🔬", title: "Hint 2 — Superpower", desc: "A remarkable biological fact revealed." },
  { emoji: "🧬", title: "Hint 3 — Anatomy", desc: "A specific physical trait described." },
  { emoji: "📸", title: "Hint 4 — Behaviour", desc: "A behavioural or cultural clue." },
  { emoji: "💡", title: "Hint 5 — Name", desc: "The common name and key distinction revealed." },
];

export default function HomePage() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [collected, setCollected] = useState(0);
  const [session, setSession_] = useState<Session | null>(null);

  useEffect(() => {
    const s = getStreakData();
    setStreak(s.currentStreak);
    setCollected(getCollection().length);
    setSession_(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession_(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <LeafParticles />

      {/* Radial background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-400/10 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-xl tracking-tight text-emerald-950">EcoGuesser</span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-sm">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-orange-700 font-mono font-bold">{streak}</span>
            </div>
          )}
          <Link
            href={session ? "/terrarium" : "/auth"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-900/10 text-sm text-emerald-950/70 hover:text-emerald-950 hover:bg-emerald-50 transition-all font-medium"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Terrarium {collected > 0 && <span className="text-emerald-600 font-mono ml-1">{collected}</span>}
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-sm">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-950/80 font-medium">{session.username}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-900/10 text-emerald-950/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-sm text-emerald-700 hover:bg-emerald-200 transition-all font-bold shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 shadow-sm text-sm text-emerald-700 mb-8 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Daily Challenge — New Species Every Day
          </div>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-6 leading-none">
            <span className="text-gradient">Eco</span>
            <span className="text-emerald-950">Guesser</span>
          </h1>

          <p className="text-xl text-emerald-950/70 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Guess the species. Unlock the science.<br />
            Every round teaches you something real about <span className="text-emerald-600 font-bold">our living planet</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/game" : "/auth"}
              id="play-today-btn"
              className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg transition-all duration-200 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] shimmer-btn"
            >
              <span className="text-2xl">🌿</span>
              Play Today's Challenge
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={session ? "/terrarium" : "/auth"}
              id="my-terrarium-btn"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-lg transition-all duration-200 shadow-sm"
            >
              <span className="text-2xl">🏡</span>
              My Terrarium
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { icon: <BookOpen className="w-5 h-5" />, label: "Species in database", value: "20", color: "text-cyan-600", bg: "bg-cyan-50" },
            { icon: <Trophy className="w-5 h-5" />, label: "Max score per round", value: "500", color: "text-lime-600", bg: "bg-lime-50" },
            { icon: <Flame className="w-5 h-5" />, label: "Your current streak", value: streak > 0 ? `${streak} 🔥` : "Start!", color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, i) => (
            <div key={i} className="glass-panel bg-white/70 backdrop-blur-xl rounded-2xl p-5 text-center border border-white shadow-xl shadow-emerald-500/5">
              <div className={`flex justify-center mb-3`}>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                   {stat.icon}
                </div>
              </div>
              <div className={`text-2xl font-black mb-1 text-emerald-950`}>{stat.value}</div>
              <div className="text-xs text-emerald-950/50 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How to play */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-black text-center mb-2 text-emerald-950">How to Play</h2>
          <p className="text-center text-emerald-950/60 font-medium text-sm mb-10">You get up to 5 hints. Fewer hints = higher score.</p>

          <div className="space-y-3">
            {HOW_TO_PLAY.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
                  {step.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-emerald-950">{step.title}</div>
                  <div className="text-xs text-emerald-950/60 font-medium mt-0.5">{step.desc}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-mono text-emerald-600 font-bold">
                  {500 - i * 100}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Conservation status legend */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20">
        <h2 className="text-xl font-black text-center mb-8 text-emerald-950">Learn Real Conservation Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { code: 'CR', label: 'Critically Endangered', color: '#ef4444', bg: '#fee2e2' },
            { code: 'EN', label: 'Endangered', color: '#ea580c', bg: '#ffedd5' },
            { code: 'VU', label: 'Vulnerable', color: '#ca8a04', bg: '#fef9c3' },
            { code: 'LC', label: 'Least Concern', color: '#059669', bg: '#d1fae5' },
          ].map(s => (
            <div key={s.code} className="rounded-2xl p-4 text-center border shadow-sm" style={{ background: s.bg, borderColor: `${s.color}30` }}>
              <div className="text-2xl font-black font-mono mb-1" style={{ color: s.color }}>{s.code}</div>
              <div className="text-xs font-bold" style={{ color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 text-center">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 shadow-lg shadow-emerald-500/5 p-12">
          <div className="text-5xl mb-4">🌍</div>
          <h2 className="text-3xl font-black mb-4 text-emerald-950">Playing Helps the Planet</h2>
          <p className="text-emerald-950/70 font-medium max-w-xl mx-auto leading-relaxed">
            Every round you play sends you directly to verified conservation charities.
            100% of our ad-free monetisation goes towards protecting real habitats.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-emerald-900/10 py-8 px-6 text-center">
        <p className="text-emerald-950/40 text-xs font-mono font-bold">
          EcoGuesser · Biodiversity data from GBIF & IUCN Red List · Built to raise awareness
        </p>
      </footer>
    </div>
  );
}
