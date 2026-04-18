"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpeciesImageProps {
  imageUrl: string;
  commonName: string;
  hintsRevealed: number; // 1-5
  isResolved: boolean;
}

// hint index → CSS filter class
const BLUR_CLASSES = [
  "sp-hidden",   // 0 — safety
  "sp-hidden",   // hint 1 — blackout
  "sp-blur-max", // hint 2 — silhouette
  "sp-blur-med", // hint 3 — still blurry
  "sp-clear",    // hint 4 — FULL PHOTO
  "sp-clear",    // hint 5 — name appears
];

export default function SpeciesImage({ imageUrl, commonName, hintsRevealed, isResolved }: SpeciesImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const blurClass = isResolved ? "sp-clear" : (BLUR_CLASSES[hintsRevealed] ?? "sp-blur-max");

  // Handle images that are already cached (onLoad won't fire for those)
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [imageUrl]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-white/40 border border-emerald-100 shadow-sm">

      {/* Actual image — always in DOM so browser can load it */}
      {!imgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={imageUrl}
          alt={isResolved ? commonName : "Mystery Species"}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className={`sp-img ${blurClass} ${imgLoaded ? "sp-img-visible" : "sp-img-loading"}`}
        />
      )}

      {/* Gradient overlay to ensure text is readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60 pointer-events-none z-[1]" />

      {/* Fallback when image actually errors */}
      {imgError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-emerald-50">
          <div className="text-7xl opacity-50">🌿</div>
          <p className="text-emerald-950/40 text-xs font-mono uppercase tracking-widest font-bold">
            {isResolved ? commonName : "Species Hidden"}
          </p>
        </div>
      )}

      {/* Loading shimmer */}
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-100/40 to-emerald-50/0 animate-pulse" />
      )}

      {/* Mystery overlay — hint 1 only */}
      <AnimatePresence>
        {!isResolved && hintsRevealed <= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none"
          >
            <div className="relative text-emerald-100">
              <div className="text-7xl drop-shadow-lg">❓</div>
              <div className="absolute inset-0 animate-ping text-7xl opacity-40">❓</div>
            </div>
            <p className="text-white/80 text-[13px] font-mono uppercase tracking-[0.2em] font-bold drop-shadow-md">Identity Unknown</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint dots */}
      <div className="absolute top-5 right-5 flex gap-2 z-10">
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className={`w-2 h-2 rounded-full transition-all duration-500 shadow-sm ${
              n < hintsRevealed ? "bg-emerald-600 shadow-emerald-900/50" :
              n === hintsRevealed ? "bg-emerald-400 scale-125 shadow-emerald-400/50" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Species name — hint 5 or resolved */}
      <AnimatePresence>
        {(isResolved || hintsRevealed >= 5) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: isResolved ? 0.4 : 0.1 }}
            className="absolute bottom-0 left-0 right-0 p-6 z-10"
          >
            <p className="text-[11px] text-emerald-300 uppercase tracking-widest font-mono font-bold mb-1 drop-shadow-md">
               {isResolved ? "Identified" : "Name Revealed"}
             </p>
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-xl">{commonName}</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal shimmer flash */}
      <AnimatePresence>
        {isResolved && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="absolute inset-0 bg-white z-20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
