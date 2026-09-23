import React, { useState } from "react";
import { Mission } from "@/lib/missions";

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  dailyMissions?: Mission[];
  onClaim: (missionId: string, isDaily?: boolean) => void;
  onClaimAll?: (isDaily?: boolean) => void;
  allCompleted: boolean;
  laserClaimed: boolean;
  onClaimLaser?: () => void;
}

export function MissionsModal({
  isOpen,
  onClose,
  missions,
  dailyMissions = [],
  onClaim,
  onClaimAll,
  allCompleted,
  laserClaimed,
  onClaimLaser,
}: MissionsModalProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "main">("daily");

  if (!isOpen) return null;

  const isDaily = activeTab === "daily";
  const list = isDaily ? dailyMissions : missions;
  const claimable = list.filter((m) => m.completed && !m.claimed);
  const totalCoins = claimable.reduce((acc, m) => acc + m.rewardCoins, 0);

  const dailyCount = dailyMissions.filter((m) => m.completed && !m.claimed).length;
  const mainCount = missions.filter((m) => m.completed && !m.claimed).length;

  const handleClaimAll = () => {
    if (claimable.length === 0) return;
    if (onClaimAll) onClaimAll(isDaily);
    else claimable.forEach((m) => onClaim(m.id, isDaily));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-none">Missionen</h2>
                {claimable.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClaimAll}
                    className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse active:scale-95"
                  >
                    <span>+{totalCoins} 🪙</span>
                    <span>Holen</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {isDaily ? "Jeden Tag neue Aufgaben & Groschen" : "Park-Erfolge & Giftgrün-Laser"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-400 hover:text-white active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 p-1 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isDaily ? "bg-amber-500/20 border border-amber-500/50 text-amber-300" : "text-neutral-400"
            }`}
          >
            <span>📅 Täglich</span>
            {dailyCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-black animate-pulse">
                {dailyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("main")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isDaily ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300" : "text-neutral-400"
            }`}
          >
            <span>🏆 Park-Erfolge</span>
            {mainCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-black animate-pulse">
                {mainCount}
              </span>
            )}
          </button>
        </div>

        {claimable.length > 0 && (
          <button
            type="button"
            onClick={handleClaimAll}
            className="w-full mt-3 shrink-0 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2 px-3 text-xs font-extrabold text-black shadow active:scale-95"
          >
            <span>🪙 {claimable.length === 1 ? "Groschen einstecken" : "Alle Groschen einstecken"}</span>
            <span className="bg-black/20 rounded px-1.5 py-0.5">+{totalCoins} Groschen</span>
          </button>
        )}

        <div className="my-3 space-y-2 overflow-y-auto pr-1 flex-1">
          {list.map((m) => {
            const cur = Math.min(m.progress || 0, m.target);
            const pct = Math.min(100, Math.round((cur / m.target) * 100));
            return (
              <div key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-neutral-100 truncate">{m.title}</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">{m.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    {m.claimed ? (
                      <span className="rounded-lg bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        Erfüllt ✓
                      </span>
                    ) : m.completed ? (
                      <button
                        type="button"
                        onClick={() => onClaim(m.id, isDaily)}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 text-[11px] font-extrabold shadow animate-pulse active:scale-95"
                      >
                        +{m.rewardCoins} 🪙 Holen
                      </button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[10px] font-bold text-neutral-200 font-mono">
                          {cur >= 1000 ? `${(cur / 1000).toFixed(1)}k` : cur} / {m.target >= 1000 ? `${m.target / 1000}k` : m.target}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold mt-0.5">+{m.rewardCoins} 🪙</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div className={`h-full rounded-full transition-all ${m.completed ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}

          {!isDaily && (
            <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base">🏆</span>
                <h3 className="font-bold text-xs text-emerald-400">Hauptpreis: Giftgrün-Laser Visier</h3>
              </div>
              <p className="text-[10px] text-neutral-400 mt-0.5">Schließe alle 5 Park-Missionen ab, um den Laser einzustecken!</p>
              <div className="mt-2.5">
                {laserClaimed ? (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    <span>✓</span>
                    <span>Giftgrün-Laser in der Handtasche & aktiv!</span>
                  </div>
                ) : allCompleted ? (
                  <button
                    type="button"
                    onClick={() => onClaimLaser && onClaimLaser()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 py-2.5 px-4 text-xs font-extrabold text-black shadow-lg animate-bounce active:scale-95"
                  >
                    <span>🟢</span>
                    <span>JETZT ABHOLEN: Giftgrün-Laser freischalten!</span>
                  </button>
                ) : (
                  <span className="inline-block rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-500">
                    🔒 Noch gesperrt ({missions.filter((m) => m.completed || m.claimed).length}/5 erledigt)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-neutral-800/80 text-center text-[10px] text-neutral-500 shrink-0">
          {isDaily ? "⏰ Tägliche Missionen werden jeden Tag neu generiert." : "Park-Aufgaben bleiben dauerhaft erhalten."}
        </div>
      </div>
    </div>
  );
}
