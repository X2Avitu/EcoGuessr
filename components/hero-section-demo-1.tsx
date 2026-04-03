"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CleanupMap } from "./cleanup-map";
import { getDirtySpots, DirtySpot } from "@/app/actions";

export default function HeroSectionOne() {
  const [spots, setSpots] = useState<DirtySpot[]>([]);

  useEffect(() => {
    // We only load 5 spots for the background teaser
    getDirtySpots().then(data => setSpots(data.slice(0, 5)));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A] m-0 p-0 flex flex-col items-center justify-center">
      
      {/* Background Map - Dimmed via an overlay */}
      <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none scale-105 blur-[2px]">
          <CleanupMap 
             userLocation={{ lat: 43.7315, lng: -79.7624 }} 
             spots={spots} 
             selectedSpotId={null} 
             onSpotSelect={() => {}} 
          />
      </div>

      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] mix-blend-overlay"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-bebas text-7xl md:text-[9rem] leading-[0.8] text-white tracking-wide uppercase drop-shadow-2xl"
        >
          Your City Is <span className="text-primary italic">Dirty.</span>
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-bebas text-5xl md:text-[6rem] leading-[0.8] text-white mb-8 tracking-wide uppercase drop-shadow-2xl"
        >
          Fix It.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="text-gray-300 text-lg md:text-2xl font-dmsans tracking-widest uppercase mb-12 max-w-xl mx-auto"
        >
          Join a squad. Show up. Make it count.
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 1 }}
           className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center"
        >
          <Link href="/protected/map" className="flex-1 bg-primary text-[#0A0A0A] font-bebas text-3xl py-4 rounded-xl hover:bg-white hover:scale-105 transition-all w-full text-center shadow-[0_0_40px_rgba(184,255,60,0.3)]">
            DROP A PIN
          </Link>
          <Link href="/protected/squads" className="flex-1 bg-transparent border-2 border-[#333] text-white hover:border-primary font-bebas text-3xl py-4 rounded-xl hover:bg-[#111] transition-all w-full text-center">
            JOIN A SQUAD
          </Link>
        </motion.div>
      </div>

      {/* Live Counter Strip */}
      <motion.div 
         initial={{ y: 50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 1.2, duration: 0.5 }}
         className="absolute bottom-0 left-0 w-full bg-primary text-[#0A0A0A] py-3 text-center overflow-hidden"
      >
        <div className="font-bebas text-2xl tracking-widest uppercase whitespace-nowrap animate-shimmer flex justify-center gap-12">
            <span>142 Spots Cleaned This Week</span>
            <span className="opacity-40">•</span>
            <span>38 Active Squads</span>
            <span className="opacity-40">•</span>
            <span>6,200 kg Waste Removed</span>
        </div>
      </motion.div>
    </div>
  );
}
