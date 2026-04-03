"use client";

import { useEffect, useState } from "react";
import { getSquads, Squad } from "@/app/actions";
import { Users, Flame, Info, CheckCircle2, Zap, X, Copy } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SquadsPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [activeTab, setActiveTab] = useState("all-time");

  // Hype mechanics
  const [hypeGenerating, setHypeGenerating] = useState(false);
  const [hypeResult, setHypeResult] = useState<string | null>(null);
  const [isHypeModalOpen, setIsHypeModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateHype = async (squad: Squad) => {
    setIsHypeModalOpen(true);
    setHypeGenerating(true);
    setHypeResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/generate-hype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squadName: squad.name,
          neighborhood: squad.neighborhood,
          totalKg: squad.totalKg,
          streak: squad.streak
        })
      });
      const data = await res.json();
      if (data.hypeText) {
        setHypeResult(data.hypeText);
      } else {
        setHypeResult("ERROR: NETWORK DISRUPTION. COULD NOT GENERATE HYPE.");
      }
    } catch {
      setHypeResult("ERROR: SYSTEM FAILURE.");
    } finally {
      setHypeGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (hypeResult) {
      navigator.clipboard.writeText(hypeResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    getSquads().then(setSquads);
  }, []);

  // Sort squads by totalKg for leaderboard
  const sortedSquads = [...squads].sort((a, b) => b.totalKg - a.totalKg);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h1 className="font-bebas text-6xl text-white tracking-widest uppercase m-0 leading-none">JOIN THE</h1>
              <h2 className="font-bebas text-8xl text-primary tracking-widest uppercase drop-shadow-[0_0_20px_rgba(184,255,60,0.3)] m-0 leading-none">MOVEMENT</h2>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0 bg-[#111] p-2 rounded-xl border border-[#333]">
              <button 
                onClick={() => setActiveTab("this-week")}
                className={`px-4 py-2 font-bebas text-xl rounded-lg transition-colors ${activeTab === 'this-week' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
              >
                 THIS WEEK
              </button>
              <button 
                onClick={() => setActiveTab("all-time")}
                className={`px-4 py-2 font-bebas text-xl rounded-lg transition-colors ${activeTab === 'all-time' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
              >
                 ALL TIME
              </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {sortedSquads.map((squad, i) => (
               <motion.div 
                 key={squad.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-[#111] overflow-hidden rounded-3xl border border-[#222] hover:border-[#444] transition-colors relative group"
               >
                 <div className="h-32 bg-[#1a1a1a] relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] mix-blend-overlay"></div>
                    <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl flex items-center justify-center font-bebas text-4xl shadow-xl border-4 border-[#0a0a0a]" style={{backgroundColor: squad.color}}>
                       {i + 1}
                    </div>
                 </div>

                 <div className="pt-10 px-6 pb-6 relative z-10">
                    <h3 className="font-bebas text-3xl text-white m-0 group-hover:text-primary transition-colors">{squad.name}</h3>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-6">{squad.neighborhood}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col items-center border border-[#222]">
                          <Flame className="text-orange-500 mb-1" size={24}/>
                          <span className="font-bebas text-2xl text-white">{squad.streak} WEEKS</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Streak</span>
                       </div>
                       <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col items-center border border-[#222]">
                          <CheckCircle2 className="text-primary mb-1" size={24}/>
                          <span className="font-bebas text-2xl text-white">{squad.totalKg} KG</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Waste Removed</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex -space-x-3">
                          {[...Array(Math.min(squad.members, 4))].map((_, idx) => (
                             <div key={idx} className="w-10 h-10 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center">
                               <Users size={16} className="text-gray-400"/>
                             </div>
                          ))}
                          {squad.members > 4 && (
                             <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-[#222] flex items-center justify-center text-xs font-bold text-gray-400">
                               +{squad.members - 4}
                             </div>
                          )}
                       </div>
                       <div className="flex gap-2">
                           <button 
                              onClick={() => generateHype(squad)}
                              className="bg-[#222] hover:bg-[#333] text-primary border border-primary/50 font-bebas text-xl px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                              title="Generate AI Hype"
                           >
                              <Zap size={20} className={hypeGenerating && isHypeModalOpen ? "animate-pulse" : ""} />
                           </button>
                           <button className="bg-white hover:bg-primary text-black font-bebas text-xl px-6 py-2 rounded-lg transition-colors">
                              JOIN
                           </button>
                       </div>
                    </div>
                 </div>
               </motion.div>
            ))}
        </div>
      </div>

      {/* AI Hype Modal Overlay */}
      <AnimatePresence>
        {isHypeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-[#111] border border-[#333] p-8 rounded-3xl max-w-lg w-full shadow-2xl relative"
            >
               <button 
                  onClick={() => setIsHypeModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
               >
                  <X size={24} />
               </button>
               
               <div className="flex items-center gap-3 mb-6">
                  <Zap className="text-primary animate-pulse" size={32} />
                  <h3 className="font-bebas text-4xl text-white m-0">PLATZ AI HYPE</h3>
               </div>

               {hypeGenerating ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                     <div className="w-12 h-12 border-4 border-[#333] border-t-primary rounded-full animate-spin"></div>
                     <p className="font-bebas text-gray-400 text-xl animate-pulse tracking-widest">CONNECTING TO GRID...</p>
                  </div>
               ) : (
                  <div className="space-y-6">
                     <div className="bg-[#1a1a1a] border border-[#222] p-6 rounded-xl relative group">
                        <p className="text-white md:text-lg whitespace-pre-wrap">{hypeResult}</p>
                     </div>
                     <button 
                        onClick={copyToClipboard}
                        className="w-full bg-primary hover:bg-white text-black font-bebas text-2xl py-4 flex items-center justify-center gap-2 rounded-xl transition-colors"
                     >
                        <Copy size={24} />
                        {copied ? "COPIED TO CLIPBOARD" : "COPY HYPE"}
                     </button>
                  </div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
