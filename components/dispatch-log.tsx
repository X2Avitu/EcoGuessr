"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Terminal, CheckCircle2 } from "lucide-react";

interface DispatchEntry {
  id: string;
  time: string;
  message: string;
  status: "pending" | "dispatched" | "resolved";
}

const mockDispatches = [
  { msg: "SEVERE HAZARD DETECTED: Illegal Dumping at Queen St.", type: "pending" },
  { msg: "311 DISPATCH: Heavy Transport En Route to Sector 4.", type: "dispatched" },
  { msg: "PLATZ SQUAD 'Neon Sweepers' Secured Zone Alpha.", type: "resolved" },
  { msg: "AI VISION ALERT: Contaminated Waste at Main Park.", type: "pending" },
  { msg: "311 DISPATCH: Biohazard Unit Deployed to Coordinates.", type: "dispatched" },
];

export function DispatchLog() {
  const [logs, setLogs] = useState<DispatchEntry[]>([]);

  useEffect(() => {
    // Inject initial logs
    const initialLogs = mockDispatches.slice(0, 3).map((d, i) => ({
      id: Math.random().toString(),
      time: new Date(Date.now() - (3 - i) * 60000).toLocaleTimeString([], { hour12: false }),
      message: d.msg,
      status: d.type as any,
    }));
    setLogs(initialLogs);

    // Simulate new dispatches coming in
    const interval = setInterval(() => {
      const randomDispatch = mockDispatches[Math.floor(Math.random() * mockDispatches.length)];
      setLogs((prev) => {
        const newLog = {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { hour12: false }),
          message: randomDispatch.msg,
          status: randomDispatch.type as any,
        };
        const updated = [newLog, ...prev];
        return updated.slice(0, 6); // Keep only last 6 logs
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-2xl mt-8">
      <div className="bg-[#111] px-4 py-3 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bebas tracking-widest">
          <Terminal size={18} />
          <span>CITY INTERFACE LINK // BRAMPTON 311</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs text-gray-500 font-mono">LIVE API</span>
        </div>
      </div>
      
      <div className="p-4 h-64 overflow-hidden relative bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] bg-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10 pointer-events-none"></div>
        <div className="space-y-3 font-mono text-sm relative z-0">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex items-start gap-3 bg-[#111]/80 p-2 rounded-lg border border-[#222]"
              >
                <div className="mt-0.5">
                  {log.status === "pending" && <AlertTriangle size={16} className="text-orange-500" />}
                  {log.status === "dispatched" && <Terminal size={16} className="text-primary" />}
                  {log.status === "resolved" && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-0.5">[{log.time}]</div>
                  <div className={
                    log.status === "pending" ? "text-orange-400 font-bold" :
                    log.status === "dispatched" ? "text-primary" :
                    "text-green-400"
                  }>
                    {log.message}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
