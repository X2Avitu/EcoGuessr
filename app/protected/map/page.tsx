"use client";

import { useState, useEffect, useRef } from "react";
import { CleanupMap } from "@/components/cleanup-map";
import {
  DirtySpot,
  getDirtySpots,
  submit311Report,
  confirmTrashSpot,
} from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, CheckCircle2, MapPin, Loader2 } from "lucide-react";

export default function MapPage() {
  const [spots, setSpots] = useState<DirtySpot[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [droppedLocation, setDroppedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewResetNonce, setViewResetNonce] = useState(0);

  useEffect(() => {
    const fetchSpots = async () => {
      const data = await getDirtySpots();
      setSpots(data);
    };

    fetchSpots();
    setUserLocation({ lat: 43.7315, lng: -79.7624 });
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setDroppedLocation({ lat, lng });
    setIsDropModalOpen(true);
  };

  const selectedSpot = spots.find((s) => s.id === selectedSpotId);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {userLocation && (
        <CleanupMap
          userLocation={userLocation}
          spots={spots}
          selectedSpotId={selectedSpotId}
          onSpotSelect={setSelectedSpotId}
          onMapClick={handleMapClick}
          viewResetNonce={viewResetNonce}
        />
      )}

      <div className="pointer-events-none absolute left-6 top-6 z-10 max-w-[90vw]">
        <h1 className="font-bebas text-5xl text-white drop-shadow-md leading-none md:text-6xl">
          YOUR CITY IS DIRTY.
        </h1>
        <h2 className="font-bebas text-4xl text-primary drop-shadow-md leading-none mt-1 md:text-5xl">
          FIX IT.
        </h2>
      </div>

      <div className="absolute right-6 top-6 z-10 flex gap-4 pointer-events-none">
        <div className="pointer-events-auto rounded-lg border border-[#333] bg-[#0A0A0A]/80 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
          {spots.length} Spots active
        </div>
      </div>

      <AnimatePresence>
        {selectedSpot && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-6 top-24 z-20 w-96 max-w-[calc(100vw-48px)] rounded-2xl border border-[#333] bg-[#0a0a0a]/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setSelectedSpotId(null)}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-4">
              <span
                className={`mb-2 inline-block rounded px-2 py-1 text-xs font-bold uppercase tracking-wider
                ${selectedSpot.severity === "large" ? "border border-red-500/50 bg-red-500/20 text-red-400" :
                  selectedSpot.severity === "medium" ? "border border-orange-500/50 bg-orange-500/20 text-orange-400" :
                    "border border-yellow-500/50 bg-yellow-500/20 text-yellow-400"}`}
              >
                {selectedSpot.severity} Severity
              </span>
              <h2 className="font-bebas text-3xl leading-tight text-white">{selectedSpot.title}</h2>
              <p className="mt-2 text-sm text-gray-400">{selectedSpot.description}</p>
            </div>

            <div className="mb-6 space-y-4">
              <div className="rounded-lg bg-[#1a1a1a] p-3">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">AI Logistics Estimate</div>
                <div className="flex justify-between text-sm">
                  <span className="text-white">Est. Effort:</span>
                  <span className="font-bold text-primary">
                    {selectedSpot.estimatedPeople} people · {selectedSpot.estimatedMinutes} mins
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-[#1a1a1a] p-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Required Supplies</div>
                <div className="flex flex-wrap gap-2">
                  {selectedSpot.supplies.map((supply, i) => (
                    <span key={i} className="rounded bg-[#2a2a2a] px-2 py-1 text-xs text-gray-300">
                      {supply}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded bg-green-400/10 p-2 text-xs text-green-400">
                <CheckCircle2 size={14} />
                Auto-reported to Brampton 311
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-primary py-4 font-bebas text-xl text-black transition-colors hover:bg-white"
            >
              HOST A CLEANUP HERE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => {
          if (userLocation) {
            setDroppedLocation(userLocation);
            setIsDropModalOpen(true);
          }
        }}
        className="absolute bottom-10 right-10 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-black shadow-[0_0_30px_rgba(184,255,60,0.5)] transition-transform hover:scale-110"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <AnimatePresence>
        {isDropModalOpen && droppedLocation && (
          <DropPinModal
            location={droppedLocation}
            onClose={() => setIsDropModalOpen(false)}
            onSuccess={(newSpot) => {
              setSpots((prev) => [newSpot, ...prev]);
              setIsDropModalOpen(false);
              setSelectedSpotId(null);
              setDroppedLocation(null);
              setViewResetNonce((n) => n + 1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      const comma = r.indexOf(",");
      const base64 = comma >= 0 ? r.slice(comma + 1) : r;
      resolve({ data: base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function DropPinModal({
  location,
  onClose,
  onSuccess,
}: {
  location: { lat: number; lng: number };
  onClose: () => void;
  onSuccess: (spot: DirtySpot) => void;
}) {
  const [step, setStep] = useState<"upload" | "analyzing" | "review">("upload");
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [aiResult, setAiResult] = useState<DirtySpot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Choose a photo of the trash or debris first.");
      return;
    }
    setError(null);
    setStep("analyzing");
    setAnalyzingProgress(0);

    const interval = setInterval(() => {
      setAnalyzingProgress((p) => (p < 88 ? p + 4 : p));
    }, 120);

    try {
      const { data, mimeType } = await fileToBase64(selectedFile);
      const res = await fetch("/api/analyze-trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: data,
          mimeType,
          lat: location.lat,
          lng: location.lng,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Analysis failed");
      }
      setAnalyzingProgress(100);
      setAiResult(json.spot as DirtySpot);
      setStep("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("upload");
    } finally {
      clearInterval(interval);
    }
  };

  const handleSubmit = async () => {
    if (!aiResult) return;
    await submit311Report(aiResult.id);
    const saved = await confirmTrashSpot(aiResult);
    onSuccess(saved);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#333] bg-[#0a0a0a] shadow-2xl"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-bebas text-3xl text-white">REPORT DIRTY SPOT</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {step === "upload" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3 text-sm text-gray-400">
                <MapPin className="shrink-0 text-primary" size={18} />
                Latching to: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={handlePickFile}
                className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#333] bg-[#111] text-gray-500 transition-colors hover:border-primary hover:text-primary"
              >
                <Upload size={32} className="mb-2" />
                <span className="font-bold">
                  {selectedFile ? selectedFile.name : "Tap to add photo"}
                </span>
                <span className="mt-1 text-xs text-gray-600">Platz AI Vision analyzes your actual image</span>
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedFile}
                className="w-full rounded-xl bg-primary py-4 font-bebas text-xl text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze photo
              </button>
            </div>
          )}

          {step === "analyzing" && (
            <div className="flex flex-col items-center space-y-6 py-12 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div>
                <h3 className="font-bebas text-2xl text-white">PLATZ AI VISION</h3>
                <p className="text-sm text-gray-400">Reading your photo for waste type and severity…</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${analyzingProgress}%` }}
                />
              </div>
            </div>
          )}

          {step === "review" && aiResult && (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-[#1a1a1a] p-4">
                <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-2 py-1 text-xs font-bold text-black">
                  AI FROM YOUR PHOTO
                </div>
                <h3 className="font-bebas text-2xl text-white mt-2">{aiResult.title}</h3>
                <p className="mt-1 text-sm text-gray-300">{aiResult.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#333] bg-[#111] p-3">
                  <div className="text-xs font-bold uppercase text-gray-500">Severity</div>
                  <div
                    className={`font-bebas text-lg ${
                      aiResult.severity === "large"
                        ? "text-red-500"
                        : aiResult.severity === "medium"
                          ? "text-orange-500"
                          : "text-yellow-500"
                    }`}
                  >
                    {aiResult.severity}
                  </div>
                </div>
                <div className="rounded-lg border border-[#333] bg-[#111] p-3">
                  <div className="text-xs font-bold uppercase text-gray-500">Est. Effort</div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {aiResult.estimatedPeople}p · {aiResult.estimatedMinutes}m
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-4 w-full rounded-lg bg-primary py-4 font-bebas text-xl text-black transition-colors hover:bg-white"
              >
                CONFIRM & DROP PIN
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
