"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, SkipForward, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getDailySpecies, getRandomPracticeSpecies, calculateScore,
  recordGameResult, getStreakData, getCollection, computeEarnedBadges,
  hasPlayedToday, type CollectedSpecies, type Badge
} from "@/lib/gameUtils";
import { Species, SPECIES_DATABASE } from "@/lib/species";
import HintCard from "@/components/HintCard";
import SpeciesImage from "@/components/SpeciesImage";
import GuessInput from "@/components/GuessInput";
import ImpactScreen from "@/components/ImpactScreen";
import ScoreDisplay from "@/components/ScoreDisplay";
import BadgeNotification from "@/components/BadgeNotification";
import { getSession, saveGameDataToServer } from "@/lib/authUtils";

type GameState = "playing" | "correct" | "gaveup";
type GameMode = "daily" | "practice";

interface RoundState {
  species: Species;
  mode: GameMode;
  hintsRevealed: number;
  gameState: GameState;
  wrongGuesses: string[];
  showImpact: boolean;
}

function freshRound(species: Species, mode: GameMode): RoundState {
  return { species, mode, hintsRevealed: 1, gameState: "playing", wrongGuesses: [], showImpact: false };
}

export default function GamePage() {
  const router = useRouter();
  const [round, setRound] = useState<RoundState | null>(null);
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<string[]>([]); // ids played in practice this session
  const [streak, setStreak] = useState(0);
  const [collection, setCollection] = useState<CollectedSpecies[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // Initialise on mount (client-only)
  useEffect(() => {
    if (!getSession()) {
      router.push("/auth");
      return;
    }

    const daily = getDailySpecies();
    setStreak(getStreakData().currentStreak);
    setCollection(getCollection());

    const played = hasPlayedToday();
    if (played.played) {
      setDailyAlreadyPlayed(true);
      // Show the daily species resolved so they can read it, but start in practice
      setRound({ ...freshRound(daily, "daily"), gameState: played.correct ? "correct" : "gaveup", hintsRevealed: 5 });
    } else {
      setRound(freshRound(daily, "daily"));
    }
  }, []);

  const startPracticeRound = useCallback(() => {
    const exclude = [getDailySpecies().id, ...practiceHistory];
    const next = getRandomPracticeSpecies(exclude);
    setPracticeHistory(prev => [...prev, next.id]);
    setRound(freshRound(next, "practice"));
  }, [practiceHistory]);

  const handleRevealNextHint = () => {
    if (!round || round.hintsRevealed >= 5) return;
    setRound(r => r ? { ...r, hintsRevealed: r.hintsRevealed + 1 } : r);
  };

  const handleGuess = useCallback((guessId: string) => {
    if (!round || round.gameState !== "playing") return;

    if (guessId === round.species.id) {
      // Correct!
      const updatedRound = { ...round, gameState: "correct" as GameState };

      if (round.mode === "daily") {
        const prevBadges = computeEarnedBadges(collection);
        recordGameResult(true, round.hintsRevealed, calculateScore(round.hintsRevealed), round.species.id);
        const updatedCollection = getCollection();
        setCollection(updatedCollection);
        setStreak(getStreakData().currentStreak);
        setDailyAlreadyPlayed(true);
        const earned = computeEarnedBadges(updatedCollection).find(b => !prevBadges.find(p => p.id === b.id));
        if (earned) setTimeout(() => setNewBadge(earned), 1500);
        // Sync to server (fire-and-forget)
        const session = getSession();
        if (session) saveGameDataToServer(session.id);
      }

      setTimeout(() => setRound({ ...updatedRound, showImpact: true }), 700);
      setRound(updatedRound);
    } else {
      const newWrong = [...round.wrongGuesses, guessId];
      if (newWrong.length >= 5) {
        // Auto give up
        const gaveUpRound = { ...round, gameState: "gaveup" as GameState, wrongGuesses: newWrong, hintsRevealed: 5 };
        if (round.mode === "daily") {
          recordGameResult(false, round.hintsRevealed, 0, round.species.id);
          setDailyAlreadyPlayed(true);
          setCollection(getCollection());
          // Sync to server (fire-and-forget)
          const session = getSession();
          if (session) saveGameDataToServer(session.id);
        }
        setTimeout(() => setRound({ ...gaveUpRound, showImpact: true }), 400);
        setRound(gaveUpRound);
      } else {
        setRound({ ...round, wrongGuesses: newWrong });
      }
    }
  }, [round, collection]);

  const handleGiveUp = useCallback(() => {
    if (!round) return;
    const gaveUpRound = { ...round, gameState: "gaveup" as GameState, hintsRevealed: 5 };
    if (round.mode === "daily" && !dailyAlreadyPlayed) {
      recordGameResult(false, round.hintsRevealed, 0, round.species.id);
      setDailyAlreadyPlayed(true);
      setCollection(getCollection());
      // Sync to server (fire-and-forget)
      const session = getSession();
      if (session) saveGameDataToServer(session.id);
    }
    setRound(gaveUpRound);
    setTimeout(() => setRound({ ...gaveUpRound, showImpact: true }), 300);
  }, [round, dailyAlreadyPlayed]);

  if (!round) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-emerald-600 font-mono text-sm animate-pulse font-bold tracking-widest">LOADING SPECIES DATA...</div>
      </div>
    );
  }

  const { species, mode, hintsRevealed, gameState, wrongGuesses, showImpact } = round;
  const isResolved = gameState !== "playing";
  const currentScore = mode === "daily" && isResolved && gameState === "correct"
    ? calculateScore(hintsRevealed)
    : mode === "daily" ? calculateScore(hintsRevealed)
    : 0;
  const inputDisabled = isResolved || (mode === "daily" && dailyAlreadyPlayed && gameState === "playing");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-300/20 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-4 py-4 border-b border-emerald-900/5 bg-white/40 backdrop-blur-md">
        <Link href="/" className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 transition-all flex-shrink-0 shadow-sm text-emerald-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Mode badge */}
        <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold shadow-sm ${
          mode === "daily"
            ? "bg-emerald-100 border border-emerald-200 text-emerald-800"
            : "bg-purple-100 border border-purple-200 text-purple-800"
        }`}>
          {mode === "daily" ? "🌿 Daily" : <><FlaskConical className="w-3 h-3" /> Practice</>}
        </div>

        <div className="flex-1 min-w-0">
          <ScoreDisplay
            streak={streak}
            collectionCount={collection.length}
            currentScore={currentScore}
            hintsRevealed={hintsRevealed}
            isResolved={isResolved}
          />
        </div>
      </header>

      {/* Main game layout */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* LEFT: Image + controls */}
          <div className="flex flex-col gap-5">
            <SpeciesImage
              imageUrl={species.imageUrl}
              commonName={species.commonName}
              hintsRevealed={hintsRevealed}
              isResolved={isResolved}
            />

            {/* Controls */}
            {!isResolved && (
              <div className="flex gap-3">
                {hintsRevealed < 5 ? (
                  <button
                    onClick={handleRevealNextHint}
                    id="reveal-hint-btn"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-800 font-bold transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                    Reveal Hint {hintsRevealed + 1}
                    {mode === "daily" && (
                      <span className="ml-auto text-xs font-mono bg-white/50 px-2 py-1 rounded-md">{500 - hintsRevealed * 100}pts max</span>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-emerald-950/50 font-bold py-4 rounded-2xl border border-emerald-100 bg-white/50">
                    All hints revealed — make your guess!
                  </div>
                )}

                <button
                  onClick={handleGiveUp}
                  id="give-up-btn"
                  className="px-5 py-4 rounded-2xl bg-white border border-emerald-100 hover:border-red-200 hover:bg-red-50 text-emerald-950/40 hover:text-red-500 transition-all shadow-sm flex items-center justify-center"
                  title="Give Up"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Resolved result bar */}
            {isResolved && !showImpact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-5 py-5 rounded-2xl border text-center shadow-sm ${
                  gameState === "correct"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="font-black text-xl mb-1">
                  {gameState === "correct"
                    ? `✅ Correct!${mode === "daily" ? ` +${currentScore} pts` : " (Practice)"}`
                    : `❌ It was ${species.commonName}`}
                </div>
                <button onClick={() => setRound(r => r ? { ...r, showImpact: true } : r)}
                  className="text-sm font-bold underline opacity-70 hover:opacity-100 transition-opacity mt-2 inline-block"
                >
                  See Impact & Share →
                </button>
              </motion.div>
            )}

            {/* Already played today banner */}
            {dailyAlreadyPlayed && mode === "daily" && isResolved && (
              <div className="px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-700 font-bold text-center">
                Daily complete! Play more practice rounds below ↓
              </div>
            )}
          </div>

          {/* RIGHT: Hints + Guess input */}
          <div className="flex flex-col gap-4">
            <div className="text-xs text-emerald-950/40 font-bold uppercase tracking-widest font-mono px-1 flex items-center gap-2">
              {mode === "daily"
                ? `Daily Challenge — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                : `Practice Round — ${species.kingdom}`}
            </div>

            {/* Hint cards */}
            <div className="space-y-3 flex-1 flex flex-col justify-start">
              {Array.from({ length: 5 }, (_, i) => (
                <HintCard
                  key={`${species.id}-${i}`}
                  hint={species.hints[i]}
                  hintNumber={i + 1}
                  isRevealed={i + 1 <= hintsRevealed}
                  isLatest={i + 1 === hintsRevealed && !isResolved}
                />
              ))}
            </div>

            {/* Guess input */}
            <div className="mt-4">
              <GuessInput
                onGuess={(id) => handleGuess(id)}
                disabled={inputDisabled}
                wrongGuesses={wrongGuesses}
              />
              {mode === "practice" && !isResolved && (
                <p className="text-xs text-purple-600/70 font-bold text-center mt-3">
                  Practice mode — no points or streak effect
                </p>
              )}
            </div>

            {/* View impact + play another buttons */}
            <AnimatePresence>
              {isResolved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 mt-2"
                >
                  <button
                    onClick={() => setRound(r => r ? { ...r, showImpact: true } : r)}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg transition-all shadow-[0_5px_20px_-5px_rgba(16,185,129,0.4)]"
                  >
                    🌍 View Impact & Conservation Status
                  </button>

                  <button
                    onClick={startPracticeRound}
                    id="play-another-btn"
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 font-bold transition-all shadow-sm"
                  >
                    <FlaskConical className="w-5 h-5" />
                    Play Another Species (Practice)
                    <span className="text-xs opacity-60 font-mono ml-1 font-bold">{SPECIES_DATABASE.length - 1 - practiceHistory.length} left</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Impact Screen */}
      <AnimatePresence>
        {showImpact && (
          <ImpactScreen
            species={species}
            correct={gameState === "correct"}
            hintsRevealed={hintsRevealed}
            mode={mode}
            onClose={() => setRound(r => r ? { ...r, showImpact: false } : r)}
            onPlayAnother={startPracticeRound}
          />
        )}
      </AnimatePresence>

      <BadgeNotification badge={newBadge} onDismiss={() => setNewBadge(null)} />
    </div>
  );
}
