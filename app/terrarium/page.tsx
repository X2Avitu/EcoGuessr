"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import Terrarium from "@/components/Terrarium";
import BadgeNotification from "@/components/BadgeNotification";
import { getCollection, getStreakData, computeEarnedBadges, type CollectedSpecies, type Badge } from "@/lib/gameUtils";
import { getSession } from "@/lib/authUtils";

export default function TerrariumPage() {
  const router = useRouter();
  const [collection, setCollection] = useState<CollectedSpecies[]>([]);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [shownBadge, setShownBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!getSession()) {
      router.push("/auth");
      return;
    }
    const col = getCollection();
    const str = getStreakData();
    const earned = computeEarnedBadges(col);
    setCollection(col);
    setStreak(str.currentStreak);
    setBadges(earned);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-200/50 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-emerald-900/10 px-6 py-5 bg-white/60 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl border border-emerald-100 bg-white flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-sm text-emerald-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight">My Terrarium</h1>
              <p className="text-sm text-emerald-950/60 font-medium">Your personal biodiversity collection</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="text-[15px] font-mono font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 shadow-sm">🔥 {streak} streak</div>
            )}
            <Link
              href="/game"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[15px] transition-colors shadow-md shadow-emerald-500/20"
            >
              Play Today 🌿
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Badges section */}
        {badges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-lime-600" />
              <h2 className="text-[13px] uppercase tracking-widest text-emerald-950/50 font-bold font-mono">Earned Badges</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.map(b => (
                <button
                  key={b.id}
                  onClick={() => setShownBadge(b)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-lime-200 bg-lime-50 hover:bg-lime-100 transition-colors shadow-sm"
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <div className="text-left">
                    <div className="text-[15px] font-bold text-lime-800">{b.title}</div>
                    <div className="text-xs text-lime-900/60 font-medium">{b.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Terrarium grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🌿</span>
            <h2 className="text-[13px] uppercase tracking-widest text-emerald-950/50 font-bold font-mono">Species Collection</h2>
          </div>
          <Terrarium collection={collection} />
        </motion.section>
      </main>

      <BadgeNotification badge={shownBadge} onDismiss={() => setShownBadge(null)} />
    </div>
  );
}
