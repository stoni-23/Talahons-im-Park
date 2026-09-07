const fs = require("fs");

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
    title: "Bahndidos im Öko-Modus 🛵",
    description: "Hol 5 Roller-Rocker vom E-Flitzer!",
    category: "bahndidos",
    target: 5,
    progress: 0,
    rewardCoins: 3,
    completed: false,
    claimed: false
  },
  {
    id: "m_talahin",
    title: "Fliegende Talahin 🧞‍♀️",
    description: "Hol die Teppich-Gleiterin 5-mal runter!",
    category: "talahin",
    target: 5,
    progress: 0,
    rewardCoins: 4,
    completed: false,
    claimed: false
  },
  {
    id: "m_hippie",
    title: "Mülltonnen-Hippie 🗑️",
    description: "Deckel drauf! Triff ihn 4-mal in der Tonne.",
    category: "hippie",
    target: 4,
    progress: 0,
    rewardCoins: 3,
    completed: false,
    claimed: false
  },
  {
    id: "m_rounds",
    title: "Dauer-Besucher 🌳",
    description: "Überlebe 10 Park-Runden.",
    category: "rounds",
    target: 10,
    progress: 0,
    rewardCoins: 4,
    completed: false,
    claimed: false
  },
  {
    id: "m_score",
    title: "Parkbank-Legende 🎯",
    description: "Sammle 10.000 Punkte insgesamt!",
    category: "score",
    target: 10000,
    progress: 0,
    rewardCoins: 6,
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
        newProg += event.score;
        changed = true;
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
console.log("✅ 1/2: missions.ts aktualisiert");
