"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight } from "lucide-react";
import { getAllSpeciesNames } from "@/lib/species";

interface GuessInputProps {
  onGuess: (speciesId: string, commonName: string) => void;
  disabled?: boolean;
  wrongGuesses?: string[]; // ids of wrong guesses
}

export default function GuessInput({ onGuess, disabled, wrongGuesses = [] }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);

  const allNames = getAllSpeciesNames();

  const filtered = query.trim().length < 1 ? [] : allNames.filter(s =>
    s.commonName.toLowerCase().includes(query.toLowerCase()) ||
    s.scientificName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const handleSelect = (id: string, name: string) => {
    if (wrongGuesses.includes(id)) return;
    setQuery(name);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = allNames.find(s =>
      s.commonName.toLowerCase() === query.toLowerCase() ||
      s.scientificName.toLowerCase() === query.toLowerCase()
    );

    if (!match) {
      setFlashWrong(true);
      setTimeout(() => setFlashWrong(false), 600);
      return;
    }

    if (wrongGuesses.includes(match.id)) {
      setFlashWrong(true);
      setTimeout(() => setFlashWrong(false), 600);
      return;
    }

    onGuess(match.id, match.commonName);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <motion.div
          animate={flashWrong ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
          className={`relative flex items-center rounded-[20px] border overflow-hidden transition-all duration-300 shadow-sm ${
            flashWrong
              ? "border-red-300 bg-red-50 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              : "border-emerald-200 bg-white focus-within:border-emerald-400 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus-within:ring-4 focus-within:ring-emerald-500/10"
          }`}
        >
          <Search className="absolute left-5 w-5 h-5 text-emerald-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={disabled ? "You already guessed today!" : "Type a species name…"}
            disabled={disabled}
            className="w-full bg-transparent pl-[3.5rem] pr-[4.5rem] py-[1.125rem] text-[15px] font-bold text-emerald-950 placeholder:text-emerald-950/30 outline-none disabled:opacity-50 disabled:bg-emerald-50/50"
            autoComplete="off"
            id="guess-input"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setShowDropdown(false); }} className="absolute right-[4.5rem] text-emerald-950/30 hover:text-emerald-950/70 transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className="absolute right-3 w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </motion.div>
      </form>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {showDropdown && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute bottom-[calc(100%+8px)] left-0 right-0 rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur-xl overflow-hidden z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
          >
            {filtered.map(s => {
              const isWrong = wrongGuesses.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={() => handleSelect(s.id, s.commonName)}
                  disabled={isWrong}
                  className={`w-full px-5 py-3.5 flex items-center gap-3 text-left transition-colors border-b border-emerald-50 last:border-0 ${
                    isWrong
                      ? "opacity-40 bg-red-50/30 cursor-not-allowed"
                      : "hover:bg-emerald-50"
                  }`}
                >
                  <div>
                    <div className="text-[15px] text-emerald-950 font-bold">{s.commonName}</div>
                    <div className="text-xs text-emerald-950/50 italic font-medium mt-0.5">{s.scientificName}</div>
                  </div>
                  {isWrong && <span className="ml-auto text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-md">✗ Wrong</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong guesses pills */}
      {wrongGuesses.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 px-1">
          {wrongGuesses.map(id => {
            const s = allNames.find(x => x.id === id);
            return s ? (
              <span key={id} className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-full px-3 py-1.5 font-mono font-bold shadow-sm">
                ✗ {s.commonName}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
