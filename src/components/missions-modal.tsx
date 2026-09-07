import React from "react";
import { Mission } from "@/lib/missions";

interface MissionsModalProps {
  onClaimLaser?: () => void;
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onClaim: (missionId: string) => void;
  onClaimAll?: () => void;
  allCompleted: boolean;
  laserClaimed: boolean;
}

export function MissionsModal({
  isOpen,
  onClose,
  missions,
  onClaim,
  onClaimAll,
  allCompleted,
  laserClaimed,
  onClaimLaser,
}: MissionsModalProps) {
  if (!isOpen) return null;

  const claimable = missions.filter((m) => m.completed && !m.claimed);
  const totalCoins = claimable.reduce((acc, m) => acc + m.rewardCoins, 0);

  const handleClaimAll = () => {
    if (claimable.length === 0) return;
    if (onClaimAll) {
      onClaimAll();
    } else {
      claimable.forEach((m) => onClaim(m.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-white shadow-2xl">
        {/* Header mit Gold-Icon & Einsammeln */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-none">Park-Missionen</h2>
                {claimable.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClaimAll}
                    className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse hover:bg-emerald-500/30 active:scale-95"
                  >
                    <span>+{totalCoins} 🪙</span>
                    <span>Holen</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">30 Groschen 🪙 Belohnung & Giftgrün-Laser</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {claimable.length > 0 ? (
              <button
                type="button"
                onClick={handleClaimAll}
                className="flex items-center gap-1 rounded-xl border border-amber-400/60 bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 shadow animate-bounce active:scale-95"
                title="Alle einsammeln"
              >
                <span>🪙</span>
                <span>+{totalCoins}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-bold text-neutral-400">
                <span>🪙</span>
                <span>30 Max</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-400 hover:text-white active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Schneller Einsammeln-Banner bei fertigen Missionen */}
        {claimable.length > 0 && (
          <button
            type="button"
            onClick={handleClaimAll}
            className="w-full mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 py-2 px-3 text-xs font-extrabold text-black shadow-md active:scale-95 transition-all"
          >
            <span>🪙 {claimable.length === 1 ? "Groschen einstecken" : "Alle Groschen einstecken"}</span>
            <span className="bg-black/20 rounded px-1.5 py-0.5">+{totalCoins} Groschen</span>
          </button>
        )}

        {/* Missionsliste */}
        <div className="my-3 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {missions.map((m) => {
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
                        Fertig ✓
                      </span>
                    ) : m.completed ? (
                      <button
                        type="button"
                        onClick={() => onClaim(m.id)}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 text-[11px] font-extrabold shadow animate-pulse active:scale-95"
                      >
                        +{m.rewardCoins} 🪙 Holen
                      </button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[10px] font-bold text-neutral-200 font-mono">
                          {cur >= 1000 ? `${(cur / 1000).toFixed(1)}k` : cur} / {m.target >= 1000 ? `${m.target / 1000}k` : m.target}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                          +{m.rewardCoins} 🪙
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.completed ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Hauptpreis Meilenstein */}
          <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base">🏆</span>
              <h3 className="font-bold text-xs text-emerald-400">Hauptpreis: Giftgrün-Laser Visier</h3>
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Schließe alle 5 Park-Missionen ab, um den Laser einzustecken!
            </p>
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 py-2.5 px-4 text-xs font-extrabold text-black shadow-lg shadow-emerald-950/50 animate-bounce active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">🟢</span>
                  <span>JETZT ABHOLEN: Giftgrün-Laser freischalten!</span>
                </button>
              ) : (
                <span className="inline-block rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-500">
                  🔒 Noch gesperrt ({missions.filter(m => m.completed || m.claimed).length}/5 erledigt)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
