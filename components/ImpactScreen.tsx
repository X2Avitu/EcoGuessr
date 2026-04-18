"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Share2, Check, ArrowRight, Thermometer, Heart, FlaskConical } from "lucide-react";
import { Species, CONSERVATION_META } from "@/lib/species";
import { buildShareText, calculateScore } from "@/lib/gameUtils";

interface ImpactScreenProps {
  species: Species;
  correct: boolean;
  hintsRevealed: number;
  mode?: "daily" | "practice";
  onClose: () => void;
  onPlayAnother?: () => void;
}

export default function ImpactScreen({ species, correct, hintsRevealed, mode = "daily", onClose, onPlayAnother }: ImpactScreenProps) {
  const [copied, setCopied] = useState(false);
  const [wikiData, setWikiData] = useState<{ extract?: string, url?: string, loading: boolean }>({ loading: true });
  const [iNatData, setINatData] = useState<{ observations_count?: number, url?: string, loading: boolean }>({ loading: true });
  const meta = CONSERVATION_META[species.conservationStatus];
  const score = correct ? calculateScore(hintsRevealed) : 0;

  useEffect(() => {
    // Wikipedia API call
    fetch(`/api/external/wikipedia?query=${encodeURIComponent(species.commonName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.extract) {
          setWikiData({ extract: data.extract, url: data.url, loading: false });
        } else {
          // fallback to scientific name
          return fetch(`/api/external/wikipedia?query=${encodeURIComponent(species.scientificName)}`)
            .then(res => res.json())
            .then(data2 => {
              if (data2.success) setWikiData({ extract: data2.extract, url: data2.url, loading: false });
              else setWikiData({ loading: false });
            });
        }
      })
      .catch(() => setWikiData({ loading: false }));

    // iNaturalist API call
    fetch(`/api/external/inaturalist?query=${encodeURIComponent(species.scientificName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setINatData({ observations_count: data.observations_count, url: data.url, loading: false });
        } else {
          setINatData({ loading: false });
        }
      })
      .catch(() => setINatData({ loading: false }));
  }, [species]);

  const handleShare = async () => {
    const text = buildShareText(species.commonName, hintsRevealed, correct, score);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: just show copied state
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-md flex items-center justify-center p-4 lg:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] bg-white border border-emerald-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
      >
        {/* Species image header */}
        <div className="relative h-60 overflow-hidden rounded-t-[32px] flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={species.imageUrl}
            alt={species.commonName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Result badge */}
          <div className="absolute top-5 left-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3, stiffness: 300 }}
              className={`px-4 py-2 rounded-xl text-[13px] font-black flex items-center gap-2 shadow-sm ${
                correct
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {correct ? "✅ Correct!" : "❌ Not quite"}
              {correct && mode === "daily" && <span className="font-mono bg-white px-1.5 py-0.5 rounded-md text-emerald-600 ml-1">+{score} pts</span>}
              {mode === "practice" && <span className="font-mono opacity-70 ml-1">Practice</span>}
            </motion.div>
          </div>

          {/* Species name */}
          <div className="absolute bottom-5 left-6 right-6">
            <div className="text-[11px] text-emerald-300 uppercase tracking-widest font-mono mb-1 font-bold">{species.kingdom}</div>
            <h2 className="text-3xl font-black text-white drop-shadow-md">{species.commonName}</h2>
            <p className="text-white/80 italic text-[15px] font-medium drop-shadow-sm mt-0.5">{species.scientificName}</p>
          </div>
        </div>

        {/* Conservation status */}
        <div className="px-6 pt-6 pb-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[20px] p-5 flex items-center gap-4 bg-white border border-gray-100 shadow-sm"
            style={{ borderLeft: `6px solid ${meta.color}` }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono mb-1.5 font-bold" style={{ color: meta.color }}>
                IUCN Conservation Status
              </div>
              <div className="text-xl font-black text-emerald-950 mb-0.5" style={{ color: meta.color }}>{meta.label}</div>
              <div className="text-[13px] text-emerald-950/60 font-medium">{meta.description}</div>
            </div>
            <div className="ml-auto text-4xl font-black opacity-10 font-mono">
              {species.conservationStatus}
            </div>
          </motion.div>
        </div>

        {/* Climate impact */}
        <div className="px-6 py-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-[20px] bg-orange-50 border border-orange-100 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-[11px] uppercase tracking-widest text-orange-600 font-mono font-bold">Climate Impact</span>
            </div>
            <p className="text-[14px] text-orange-950/80 font-medium leading-relaxed">{species.climateImpact}</p>
          </motion.div>
        </div>

        {/* Fun fact */}
        <div className="px-6 py-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-[20px] bg-cyan-50 border border-cyan-100 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] uppercase tracking-widest text-cyan-600 font-mono font-bold">✨ Fun Fact</span>
            </div>
            <p className="text-[14px] text-cyan-950/80 font-medium leading-relaxed">{species.funFact}</p>
          </motion.div>
        </div>

        {/* Live Data block */}
        <div className="px-6 py-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            className="rounded-[20px] bg-blue-50 border border-blue-100 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-widest text-blue-600 font-mono font-bold">📡 Live Scientific Data</span>
            </div>
            
            <div className="space-y-4">
              {/* iNat */}
              <div className="text-sm">
                <span className="font-bold text-blue-900">iNaturalist Observations: </span>
                {iNatData.loading ? (
                  <span className="text-blue-900/50 italic animate-pulse">Fetching global database...</span>
                ) : iNatData.observations_count !== undefined ? (
                  <a href={iNatData.url} target="_blank" className="font-mono text-blue-600 hover:text-blue-500 font-bold underline">
                    {iNatData.observations_count.toLocaleString()} sightings
                  </a>
                ) : (
                  <span className="text-blue-900/50 italic">Data unavailable</span>
                )}
              </div>

              {/* Wiki */}
              <div className="text-sm">
                 <span className="font-bold text-blue-900 flex items-center gap-1">Wikipedia Reference <ExternalLink className="w-3 h-3 text-blue-600"/>:</span>
                 {wikiData.loading ? (
                   <p className="text-blue-900/50 italic mt-1 animate-pulse">Connecting to Wikipedia...</p>
                 ) : wikiData.extract ? (
                   <p className="text-blue-950/80 font-medium leading-relaxed mt-1 line-clamp-3">{wikiData.extract}</p>
                 ) : (
                   <p className="text-blue-900/50 italic mt-1">Wikipedia summary unavailable</p>
                 )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Emoji share result */}
        <div className="px-6 py-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-2"
          >
            <div className="text-2xl tracking-[0.3em] mb-3 bg-gray-50 inline-block px-4 py-2 rounded-xl border border-gray-100 shadow-inner">
              {buildShareText(species.commonName, hintsRevealed, correct, score).split('\n')[1]}
            </div>
            <div className="text-[11px] text-emerald-950/40 font-mono uppercase tracking-widest font-bold">
              {correct ? `Guessed in ${hintsRevealed} hint${hintsRevealed !== 1 ? 's' : ''}` : 'Better luck tomorrow!'}
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 space-y-3 flex-shrink-0">
          {/* Charity CTA */}
          <a
            href={species.charityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-6 py-4 rounded-[20px] bg-emerald-500 hover:bg-emerald-400 transition-all duration-200 text-white group relative overflow-hidden shimmer-btn shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                 <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="text-[15px] font-black">Protect This Species</div>
                <div className="text-[12px] font-bold opacity-90">{species.charityName}</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Share + Close row */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-[16px] border border-emerald-200 bg-white hover:bg-emerald-50 transition-all text-[15px] font-bold text-emerald-900 shadow-sm"
            >
              {copied ? <><Check className="w-5 h-5 text-emerald-500" /> Copied!</> : <><Share2 className="w-5 h-5 text-emerald-500" /> Share</>}
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-[16px] border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[15px] transition-all shadow-sm"
            >
              Close <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Play Another — practice */}
          {onPlayAnother && (
            <button
              onClick={() => { onClose(); setTimeout(onPlayAnother, 100); }}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-[16px] border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[15px] transition-all mt-2 shadow-sm"
            >
              <FlaskConical className="w-5 h-5" />
              Play Another Species (Practice)
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
