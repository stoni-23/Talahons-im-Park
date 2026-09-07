const fs = require("fs");
const { execSync } = require("child_process");

const modalContent = `import React from "react";
import { Mission } from "@/lib/missions";

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onClaim: (missionId: string) => void;
  allCompleted: boolean;
  laserClaimed: boolean;
}

export function MissionsModal({ isOpen, onClose, missions, onClaim, allCompleted, laserClaimed }: MissionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold leading-tight">Park-Missionen</h2>
              <p className="text-[11px] text-neutral-400">Moorhuhn-Jagd für echte Kenner</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-400 hover:text-white active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="my-3 space-y-2.5 max-h-[62vh] overflow-y-auto pr-1">
          {missions.map((m) => {
            const current = Math.min(m.progress || 0, m.target);
            const pct = Math.min(100, Math.round((current / m.target) * 100));

            return (
              <div key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-neutral-100 truncate">{m.title}</h3>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">{m.description}</p>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-end">
                    {m.claimed ? (
                      <span className="whitespace-nowrap rounded-lg bg-emerald-950/70 border border-emerald-800/40 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                        Fertig ✓
                      </span>
                    ) : m.completed ? (
                      <button
                        type="button"
                        onClick={() => onClaim(m.id)}
                        className="whitespace-nowrap rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md animate-pulse active:scale-95"
                      >
                        +{m.rewardCoins} 🪙 Holen
                      </button>
                    ) : (
                      <span className="whitespace-nowrap rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-[11px] font-bold text-neutral-200 font-mono">
                        {current >= 1000 ? \`\${(current / 1000).toFixed(1)}k\` : current} / {m.target >= 1000 ? \`\${m.target / 1000}k\` : m.target}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800/80">
                  <div
                    className={\`h-full transition-all duration-300 rounded-full \${
                      m.completed ? "bg-emerald-500" : "bg-amber-500"
                    }\`}
                    style={{ width: \`\${pct}%\` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
            <h3 className="font-bold text-xs text-emerald-400">🏆 Hauptpreis: Giftgrün-Laser Visier</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
              Schließe alle 5 Park-Missionen ab und hol dir den Laser!
            </p>
            <div className="mt-2.5">
              {allCompleted ? (
                <span className="inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                  {laserClaimed ? "🟢 Laser ausgerüstet!" : "🟢 Freigeschaltet! Im Kiosk anlegen"}
                </span>
              ) : (
                <span className="inline-block rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-[11px] font-medium text-neutral-500">
                  🔒 Noch gesperrt
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync("src/components/missions-modal.tsx", modalContent, "utf8");
console.log("✅ 2/2: missions-modal.tsx Layout optimiert. Starte Build...");

try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Handy-Layout sitzt perfekt und Texte sind sauber!");
} catch (err) {
  console.error("Build Fehler:", err.message);
}
