const fs = require("fs");
const { execSync } = require("child_process");

console.log("=== 1. src/lib/missions.ts anlegen ==px");
const missionsLib = `export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export const INITIAL_MISSIONS: Mission[] = [
  { id: "m1", title: "Erste Schritte", description: "Spiele 3 Runden im Park", target: 3, rewardCoins: 2, completed: false, claimed: false },
  { id: "m2", title: "Scharfes Auge", description: "Lande insgesamt 10 Kopftreffer", target: 10, rewardCoins: 3, completed: false, claimed: false },
  { id: "m3", title: "Treffsicher", description: "Erreiche in einer Runde mindestens 1.000 Punkte", target: 1000, rewardCoins: 3, completed: false, claimed: false },
  { id: "m4", title: "Reaktionsschnell", description: "Treffe 5 fliegende Objekte / Tauben", target: 5, rewardCoins: 4, completed: false, claimed: false },
  { id: "m5", title: "Ausdauer", description: "Erziele insgesamt 50 Treffer über alle Spiele", target: 50, rewardCoins: 5, completed: false, claimed: false }
];
`;
fs.writeFileSync("src/lib/missions.ts", missionsLib, "utf8");

console.log("=== 2. src/components/missions-modal.tsx anlegen ===");
const modalCode = `import React from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold">Park-Missionen</h2>
          </div>
          <button onClick={onClose} className="rounded-lg bg-neutral-800 px-3 py-1 text-sm font-bold text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5">
              <div>
                <h3 className="font-bold text-sm text-neutral-200">{m.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{m.description}</p>
              </div>
              <div>
                {m.claimed ? (
                  <span className="rounded-lg bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 text-xs font-bold text-emerald-400">
                    Eingestrichen ✓
                  </span>
                ) : m.completed ? (
                  <button
                    onClick={() => onClaim(m.id)}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-pulse"
                  >
                    {m.rewardCoins} 🪙 Abholen
                  </button>
                ) : (
                  <span className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-500">
                    Offen
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Hauptpreis Meilenstein */}
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
            <h3 className="font-bold text-sm text-emerald-400">🏆 Hauptpreis: Giftgrün-Laser Visier</h3>
            <p className="text-xs text-neutral-400 mt-1">Schließe alle 5 Missionen ab, um den Laser freizuschalten!</p>
            <div className="mt-3">
              {allCompleted ? (
                <span className="inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
                  {laserClaimed ? "🟢 Giftgrün-Laser freigeschaltet & ausgerüstet!" : "🟢 Freigeschaltet! Im Kiosk ausrüstbar"}
                </span>
              ) : (
                <span className="inline-block rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-500">
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
fs.writeFileSync("src/components/missions-modal.tsx", modalCode, "utf8");

console.log("\n=== 3. Vite Build prüfen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Missions-Struktur und Modal fehlerfrei angelegt!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
