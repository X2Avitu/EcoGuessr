import HeroSectionOne from "@/components/hero-section-demo-1";
import { DispatchLog } from "@/components/dispatch-log";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0A0A0A] relative overflow-hidden pb-32">
      <HeroSectionOne />
      <div className="max-w-4xl w-full mx-auto px-6 mt-12 relative z-20">
         <h2 className="font-bebas text-4xl text-white mb-2 tracking-widest uppercase">CITY GRID CONNECTION</h2>
         <p className="text-gray-400 font-mono text-sm mb-6">Live AI integration monitoring urban contamination threats and dispatching city services.</p>
         <DispatchLog />
      </div>
    </main>
  )
}