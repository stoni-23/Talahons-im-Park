const fs = require("fs");

console.log("=== 1. src/lib/missions.ts schreiben ===");
const missionsContent = `export interface Mission {
  id: string;
  title: string;
  description: string;
  category: "bahndidos" | "talahin" | "hippie" | "rounds" | "score";
  target: number;
  progress: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: "m_bahndidos",
    title: "Roller-Razzia",
    description: "Erwische 3 Bahndidos auf ihren schnellen Rollern 🛵",
    category: "bahndidos",
    target: 3,
    progress: 0,
    rewardCoins: 3,
    completed: false,
    claimed: false
  },
  {
    id: "m_talahin",
    title: "Teppich-Absturz",
    description: "Triff 3-mal die fliegende Talahin auf dem Teppich 🧞‍♀️",
    category: "talahin",
    target: 3,
    progress: 0,
    rewardCoins: 4,
    completed: false,
    claimed: false
  },
  {
    id: "m_hippie",
    title: "Mülltonnen-Ruhe",
    description: "Schicke den Park-Hippie 2-mal zurück in seine Mülltonne 🗑️",
    category: "hippie",
    target: 2,
    progress: 0,
    rewardCoins: 3,
    completed: false,
    claimed: false
  },
  {
    id: "m_rounds",
    title: "Park-Stammgast",
    description: "Absolviere 5 vollständige Runden im Park 🌳",
    category: "rounds",
    target: 5,
    progress: 0,
    rewardCoins: 3,
    completed: false,
    claimed: false
  },
  {
    id: "m_score",
    title: "Moorhuhn-Meisterschütze",
    description: "Erziele mindestens 1.500 Punkte in einer einzelnen Runde 🎯",
    category: "score",
    target: 1500,
    progress: 0,
    rewardCoins: 5,
    completed: false,
    claimed: false
  }
];

export function updateMissionProgress(
  missions: Mission[],
  event: { type: "hit" | "round_end"; act?: string; score?: number }
): { updated: Mission[]; changed: boolean } {
  let changed = false;

  const next = missions.map((m) => {
    let newProg = m.progress || 0;

    if (event.type === "hit") {
      if (m.category === "bahndidos" && event.act === "rocker") {
        newProg += 1;
        changed = true;
      } else if (m.category === "talahin" && event.act === "carpet") {
        newProg += 1;
        changed = true;
      } else if (m.category === "hippie" && event.act === "hippie") {
        newProg += 1;
        changed = true;
      }
    } else if (event.type === "round_end") {
      if (m.category === "rounds") {
        newProg += 1;
        changed = true;
      } else if (m.category === "score" && typeof event.score === "number") {
        if (event.score > newProg) {
          newProg = event.score;
          changed = true;
        }
      }
    }

    const completed = newProg >= m.target;
    if (completed !== m.completed || newProg !== m.progress) {
      changed = true;
      return {
        ...m,
        progress: newProg,
        completed: completed || m.completed
      };
    }

    return m;
  });

  return { updated: next, changed };
}
`;
fs.writeFileSync("src/lib/missions.ts", missionsContent, "utf8");
console.log("  [+] missions.ts erfolgreich aktualisiert.");

console.log("=== 2. src/components/missions-modal.tsx schreiben ===");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-xl font-bold">Park-Missionen</h2>
              <p className="text-xs text-neutral-400">Moorhuhn-Style Aufgaben für deinen Park-Erfolg</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-neutral-800 px-3 py-1 text-sm font-bold text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {missions.map((m) => {
            const current = Math.min(m.progress || 0, m.target);
            const pct = Math.min(100, Math.round((current / m.target) * 100));

            return (
              <div key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
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
                      <span className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 font-mono">
                        {current} / {m.target}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
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

          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
            <h3 className="font-bold text-sm text-emerald-400">🏆 Hauptpreis: Giftgrün-Laser Visier</h3>
            <p className="text-xs text-neutral-400 mt-1">Schließe alle 5 Park-Missionen ab, um den Giftgrün-Laser freizuschalten!</p>
            <div className="mt-3">
              {allCompleted ? (
                <span className="inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
                  {laserClaimed ? "🟢 Giftgrün-Laser ausgerüstet!" : "🟢 Freigeschaltet! Im Kiosk ausrüstbar"}
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
fs.writeFileSync("src/components/missions-modal.tsx", modalContent, "utf8");
console.log("  [+] missions-modal.tsx erfolgreich aktualisiert.");
