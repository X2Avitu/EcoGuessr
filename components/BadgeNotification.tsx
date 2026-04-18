"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/lib/gameUtils";

interface BadgeNotificationProps {
  badge: Badge | null;
  onDismiss: () => void;
}

export default function BadgeNotification({ badge, onDismiss }: BadgeNotificationProps) {
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-5 px-6 py-4 rounded-[24px] bg-white border border-lime-200 shadow-[0_15px_40px_rgba(132,204,22,0.15)] max-w-sm w-[90vw]"
        >
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-lime-50 rounded-xl border border-lime-100 text-3xl shadow-sm">
            {badge.emoji}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-[10px] text-lime-600 uppercase tracking-widest font-mono font-bold mb-0.5">Badge Unlocked!</div>
            <div className="text-lime-950 font-black text-[15px] truncate">{badge.title}</div>
            <div className="text-lime-900/60 text-[12px] font-medium leading-tight mt-0.5">{badge.description}</div>
          </div>
          <button
            onClick={onDismiss}
            className="absolute top-2 right-3 w-6 h-6 flex items-center justify-center text-lime-950/30 hover:text-lime-950/70 hover:bg-lime-50 rounded-full transition-colors font-bold text-lg leading-none"
          >
            ×
          </button>
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4.5, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-lime-400 to-lime-300 w-full rounded-b-[24px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
