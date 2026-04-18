"use client";

import { motion } from "framer-motion";
import { Flame, Leaf, Trophy } from "lucide-react";

interface ScoreDisplayProps {
  streak: number;
  collectionCount: number;
  currentScore: number;
  hintsRevealed: number;
  isResolved: boolean;
}

export default function ScoreDisplay({ streak, collectionCount, currentScore, hintsRevealed, isResolved }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 rounded-[20px] bg-white border border-emerald-100 shadow-sm w-full">
      {/* Streak */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center shadow-sm ${streak > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-100'}`}>
          <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
        </div>
        <div>
          <div className={`text-lg font-black leading-none ${streak > 0 ? 'text-orange-950' : 'text-emerald-950/40'}`}>{streak}</div>
          <div className="text-[9px] text-emerald-950/50 uppercase font-bold tracking-wider">Streak</div>
        </div>
      </div>

      {/* Hints dots */}
      <div className="flex flex-col items-center gap-1.5 px-4 border-l border-r border-emerald-50">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(n => (
            <div
              key={n}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 shadow-sm ${
                n < hintsRevealed ? 'bg-red-400' :
                n === hintsRevealed && !isResolved ? 'bg-emerald-500 scale-125 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                n === hintsRevealed && isResolved ? 'bg-emerald-400' :
                'bg-emerald-100'
              }`}
            />
          ))}
        </div>
        <div className="text-[9px] text-emerald-950/50 font-bold uppercase tracking-wider">Hints Used</div>
      </div>

      <div className="flex gap-6 items-center">
        {/* Collection */}
        <div className="flex items-center gap-2">
          <div>
            <div className="text-[17px] font-black text-emerald-950 leading-none text-right">{collectionCount}</div>
            <div className="text-[9px] text-emerald-950/50 font-bold uppercase tracking-wider text-right">Collected</div>
          </div>
        </div>

        {/* Score */}
        {(isResolved || hintsRevealed > 0) && (
          <div className="flex items-center gap-2">
            <div>
              <motion.div
                key={currentScore}
                initial={{ scale: 1.4, color: '#10b981' }}
                animate={{ scale: 1, color: '#022c22' }}
                transition={{ duration: 0.4 }}
                className="text-[17px] font-black leading-none text-right font-mono"
              >
                {currentScore}
              </motion.div>
              <div className="text-[9px] text-emerald-950/50 font-bold uppercase tracking-wider text-right">Pts</div>
            </div>
            <div className="w-9 h-9 rounded-[14px] bg-lime-50 border border-lime-200 flex items-center justify-center shadow-sm">
              <Trophy className="w-4 h-4 text-lime-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
