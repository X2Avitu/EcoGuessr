"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HintCardProps {
  hint: string;
  hintNumber: number;
  isRevealed: boolean;
  isLatest: boolean;
}

export default function HintCard({ hint, hintNumber, isRevealed, isLatest }: HintCardProps) {
  const icons = ["🌍", "🔬", "🧬", "📸", "💡"];

  return (
    <AnimatePresence>
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`relative rounded-[20px] overflow-hidden border transition-all duration-300 ${
            isLatest
              ? "border-emerald-200 bg-white shadow-[0_5px_15px_rgba(16,185,129,0.08)] scale-[1.01]"
              : "border-emerald-100 bg-white/60 shadow-sm"
          }`}
        >
          {/* Top accent bar */}
          {isLatest && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-100 opacity-90" />
          )}

          <div className="p-4 flex gap-4">
            {/* Hint number badge */}
            <div className="flex-shrink-0 mt-0.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                isLatest
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                  : "bg-gray-50 border border-gray-200 text-gray-500 opacity-70"
              }`}>
                {icons[hintNumber - 1]}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className={`text-[10px] uppercase tracking-widest font-mono mb-1 font-bold ${
                isLatest ? "text-emerald-500" : "text-emerald-950/40"
              }`}>
                Clue {hintNumber}
              </div>
              <p className={`text-[14px] leading-relaxed font-medium ${
                isLatest ? "text-emerald-950" : "text-emerald-950/60"
              }`}>
                {hint}
              </p>
            </div>
          </div>

          {/* Latest pulse indicator */}
          {isLatest && (
            <div className="absolute top-4 right-4 w-2 h-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative">
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
