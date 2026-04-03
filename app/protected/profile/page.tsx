"use client";

import { useEffect, useState } from "react";
import { getProfile, getSquads, Squad } from "@/app/actions";
import { Award, Share2, MapPin, Map as MapIcon, Calendar, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [userSquad, setUserSquad] = useState<Squad | null>(null);

  useEffect(() => {
    const loadData = async () => {
        const user = await getProfile();
        const squads = await getSquads();
        setProfile(user);
        if (!user) return;
        const mySquad = squads.find((s) => user.joinedParties.includes(s.id));
        if (mySquad) setUserSquad(mySquad);
    };
    loadData();
  }, []);

  if (!profile)
    return (
      <div className="flex h-full items-center justify-center bg-[#0A0A0A] p-8 text-gray-400">
        Could not load profile.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 px-6 md:px-12 pb-20 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
            <motion.div 
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="w-full md:w-1/3 space-y-8"
            >
               {/* User Card */}
               <div className="bg-[#111] p-8 rounded-3xl border border-[#333] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                  
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-orange-500 mb-6 flex items-center justify-center font-bebas text-5xl text-black border-4 border-[#0a0a0a] shadow-xl">
                      {profile.display_name.charAt(0)}
                  </div>
                  <h1 className="font-bebas text-5xl text-white tracking-widest leading-none mb-1">{profile.display_name}</h1>
                  <p className="font-dmsans text-gray-500 font-bold uppercase tracking-widest text-sm mb-8">@{profile.username}</p>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
                          <div className="font-bebas text-4xl text-primary">87 KG</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Waste Removed</div>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
                          <div className="font-bebas text-4xl text-white">12</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Cleanups</div>
                      </div>
                  </div>
               </div>

               {/* Squad Assigmnent */}
               {userSquad && (
                   <div className="bg-[#111] p-6 rounded-3xl border border-[#333]">
                       <h3 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">ACTIVE SQUAD</h3>
                       <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-[#1a1a1a]" style={{backgroundColor: userSquad.color}}>
                               <UsersIcon />
                           </div>
                           <div>
                               <h4 className="font-bebas text-2xl text-white tracking-widest">{userSquad.name}</h4>
                               <p className="text-xs text-gray-400 font-bold uppercase">{userSquad.neighborhood} · {userSquad.members} Members</p>
                           </div>
                       </div>
                   </div>
               )}
            </motion.div>

            <motion.div 
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="w-full md:w-2/3 space-y-12"
            >
                {/* 2025 WRAPPED CARD */}
                <div>
                   <h3 className="font-bebas text-4xl text-white tracking-widest mb-6">YEARLY IMPACT REPORT</h3>
                   <div className="bg-gradient-to-br from-primary to-green-600 rounded-3xl p-1 shadow-[0_0_50px_rgba(184,255,60,0.15)] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] mix-blend-overlay opacity-50 z-10 pointer-events-none"></div>
                      <div className="bg-[#0A0A0A] rounded-[22px] p-8 lg:p-12 relative z-20 h-full flex flex-col md:flex-row items-center justify-between gap-8">
                         <div>
                            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-md text-xs font-bold font-dmsans uppercase tracking-widest mb-6">
                               <MapIcon size={14}/> Brampton, ON
                            </div>
                            <h2 className="font-bebas text-5xl md:text-7xl text-white leading-none">THE 2025<br/><span className="text-primary italic">WRAPPED</span></h2>
                            <p className="text-gray-400 font-dmsans uppercase text-sm font-bold tracking-widest mt-6 max-w-sm">
                               You personally prevented 87kg of hazardous waste from entering the local ecosystem this year.
                            </p>
                         </div>
                         <div className="text-center md:text-right">
                            <div className="font-bebas text-8xl md:text-9xl text-white opacity-20 leading-[0.8] mb-4 group-hover:opacity-100 group-hover:text-primary transition-all duration-500">
                               #12
                            </div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">CITY RANKING</div>
                         </div>
                      </div>
                      <button className="absolute top-6 right-6 z-30 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-xl">
                          <Share2 size={18}/>
                      </button>
                   </div>
                </div>

                {/* BADGE WALL */}
                <div>
                   <h3 className="font-bebas text-4xl text-white tracking-widest mb-6 flex items-center gap-3">
                       <Award className="text-primary" /> BADGE WALL
                   </h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {badges.map((badge, i) => (
                         <div key={i} className="bg-[#111] p-6 rounded-2xl border border-[#222] flex flex-col items-center justify-center text-center group hover:border-primary transition-colors">
                            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] mb-4 flex items-center justify-center border-2 border-[#333] group-hover:border-primary transition-colors shadow-inner">
                               <badge.icon className={`w-8 h-8 ${badge.color}`} />
                            </div>
                            <h4 className="font-bebas text-xl text-white mb-1">{badge.title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{badge.date}</p>
                         </div>
                      ))}
                   </div>
                </div>

            </motion.div>
        </div>
      </div>
    </div>
  );
}

function UsersIcon() {
  return <Flame size={20} className="text-[#0a0a0a]" />;
}

const badges = [
    { title: "First Cleanup", date: "Jan 12, 2024", icon: MapPin, color: "text-white" },
    { title: "Squad Captain", date: "Feb 04, 2024", icon: Award, color: "text-primary" },
    { title: "5-Week Streak", date: "Mar 18, 2024", icon: Flame, color: "text-orange-500" },
    { title: "50KG Club", date: "Apr 22, 2024", icon: Calendar, color: "text-blue-400" },
]