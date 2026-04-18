"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CollectedSpecies } from "@/lib/gameUtils";
import { getSpeciesById, CONSERVATION_META, SPECIES_DATABASE } from "@/lib/species";
import { ExternalLink } from "lucide-react";

interface TerrariumProps {
  collection: CollectedSpecies[];
}

export default function Terrarium({ collection }: TerrariumProps) {
  const totalSpecies = SPECIES_DATABASE.length;
  const collectedIds = new Set(collection.map(c => c.id));

  const statusCounts = SPECIES_DATABASE.reduce<Record<string, number>>((acc, s) => {
    if (collectedIds.has(s.id)) {
      acc[s.conservationStatus] = (acc[s.conservationStatus] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div>
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-[20px] bg-white border border-emerald-100 shadow-sm p-5 text-center">
          <div className="text-4xl font-black text-gradient mb-2">{collection.length}</div>
          <div className="text-[11px] text-emerald-950/50 uppercase tracking-widest font-bold">Discovered</div>
        </div>
        <div className="rounded-[20px] bg-white border border-emerald-100 shadow-sm p-5 text-center">
          <div className="text-4xl font-black text-emerald-950 mb-2">{totalSpecies}</div>
          <div className="text-[11px] text-emerald-950/50 uppercase tracking-widest font-bold">Total Species</div>
        </div>
        <div className="rounded-[20px] bg-white border border-emerald-100 shadow-sm p-5 text-center">
          <div className="text-4xl font-black text-lime-600 mb-2">
            {Math.round((collection.length / totalSpecies) * 100)}%
          </div>
          <div className="text-[11px] text-emerald-950/50 uppercase tracking-widest font-bold">Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-10 bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] text-emerald-950/50 uppercase tracking-widest font-bold">Collection Progress</span>
          <span className="text-xs text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-1 rounded-md">{collection.length} / {totalSpecies}</span>
        </div>
        <div className="h-2.5 bg-emerald-50 border border-emerald-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(collection.length / totalSpecies) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-inner"
          />
        </div>
      </div>

      {/* Conservation breakdown */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-10">
          {Object.entries(statusCounts).map(([status, count]) => {
            const m = CONSERVATION_META[status as keyof typeof CONSERVATION_META];
            return (
              <div key={status} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono border shadow-sm" style={{ background: m.bg, borderColor: `${m.color}30`, color: m.color }}>
                <span className="font-bold">{status}</span>
                <span className="opacity-70 font-bold ml-1">×{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Species grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {SPECIES_DATABASE.map((species, i) => {
          const collected = collection.find(c => c.id === species.id);
          const isCollected = !!collected;
          const meta = CONSERVATION_META[species.conservationStatus];

          return (
            <motion.div
              key={species.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`relative rounded-[20px] overflow-hidden border transition-all duration-300 ${
                isCollected
                  ? "border-emerald-200 hover:border-emerald-400 hover:shadow-[0_10px_20px_rgba(16,185,129,0.15)] cursor-pointer bg-white"
                  : "border-emerald-100 bg-emerald-50 opacity-60"
              }`}
            >
              {/* Biome background only visible slightly to tint or heavily in dark mode? In light mode we can use white bg with a colored top image area */}
              
              {/* Species image */}
              {isCollected ? (
                <div className="relative h-36 overflow-hidden">
                  <div className={`absolute inset-0 biome-${species.biome} opacity-30`} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={species.imageUrl}
                    alt={species.commonName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover mix-blend-overlay"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              ) : (
                <div className="relative h-36 flex items-center justify-center bg-white border-b border-emerald-50">
                  <div className="text-4xl opacity-20 filter grayscale">🌿</div>
                </div>
              )}

              {/* Info */}
              <div className="relative p-4">
                {isCollected ? (
                  <>
                    <div className="text-[13px] font-black text-emerald-950 leading-tight mb-1 truncate">{species.commonName}</div>
                    <div className="text-[10px] text-emerald-950/50 font-medium italic mb-3 truncate">{species.scientificName}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono px-2 py-1 rounded-lg border" style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}30` }}>
                        {species.conservationStatus}
                      </span>
                      {collected && (
                        <span className="text-[10px] text-emerald-600 font-bold font-mono">{collected.score}pts</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center pt-2">
                    <div className="text-3xl mb-2 opacity-50">{species.emoji}</div>
                    <div className="text-[10px] text-emerald-950/40 font-bold uppercase tracking-widest">Undiscovered</div>
                  </div>
                )}
              </div>

              {/* Collection date */}
              {isCollected && collected && (
                <div className="absolute top-3 right-3 text-[9px] bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-emerald-950 font-bold font-mono shadow-sm">
                  {new Date(collected.dateCollected).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}

              {/* Kingdom indicator */}
              <div className={`absolute top-3 left-3 text-[9px] px-2 py-1 rounded-lg font-bold font-mono shadow-sm ${
                species.kingdom === 'Animal' ? 'bg-blue-100 text-blue-800' :
                species.kingdom === 'Plant' ? 'bg-emerald-100 text-emerald-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {species.kingdom}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {collection.length === 0 && (
        <div className="mt-10 text-center py-20 rounded-[32px] border-2 border-dashed border-emerald-200 bg-white shadow-sm">
          <div className="text-6xl mb-6 float inline-block">🌱</div>
          <p className="text-emerald-950/50 font-bold text-base mb-6">Your terrarium is empty.<br/>Play a round to discover your first species!</p>
          <Link href="/game" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-[15px] hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20">
            Play Now <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
