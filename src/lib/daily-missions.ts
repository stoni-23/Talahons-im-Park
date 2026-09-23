import { Mission } from "./missions";

export interface DailyMissionState {
  date: string;
  missions: Mission[];
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DAILY_MISSION_POOL = [
  { id: "d_score_15k", title: "Park-Spazierer 🎯", description: "Sammle heute mindestens 15.000 Punkte / XP im Park.", category: "score" as const, target: 15000, rewardCoins: 2 },
  { id: "d_score_25k", title: "Park-Meister 🎯", description: "Sammle heute mindestens 25.000 Punkte / XP im Park.", category: "score" as const, target: 25000, rewardCoins: 3 },
  { id: "d_score_35k", title: "Highscore-Legende 👑", description: "Erziele heute insgesamt 35.000 Punkte / XP.", category: "score" as const, target: 35000, rewardCoins: 4 },
  { id: "d_rounds_2", title: "Frische Luft 🌳", description: "Absolviere heute 2 Runden im Park.", category: "rounds" as const, target: 2, rewardCoins: 1 },
  { id: "d_rounds_4", title: "Ausdauer-Spaziergang 🌳", description: "Absolviere heute 4 Runden im Park.", category: "rounds" as const, target: 4, rewardCoins: 3 },
  { id: "d_rounds_6", title: "Park-Stammgast 🌳", description: "Drehe heute 6 Runden durch den Park.", category: "rounds" as const, target: 6, rewardCoins: 4 },
  { id: "d_talahin_2", title: "Teppich-Kontrolle 🧞‍♀️", description: "Hol heute 2 Fliegende Talahins vom Teppich.", category: "talahin" as const, target: 2, rewardCoins: 2 },
  { id: "d_talahin_4", title: "Luftraum-Überwachung 🧞‍♀️", description: "Triff heute 4 Fliegende Talahins in der Luft.", category: "talahin" as const, target: 4, rewardCoins: 3 },
  { id: "d_bahndidos_2", title: "Roller-Bremse 🛵", description: "Triff heute 2 Bahndidos auf dem E-Roller.", category: "bahndidos" as const, target: 2, rewardCoins: 2 },
  { id: "d_bahndidos_5", title: "Verkehrs-Rowdy-Schreck 🛵", description: "Erwische heute 5 Bahndidos auf dem Roller.", category: "bahndidos" as const, target: 5, rewardCoins: 3 },
  { id: "d_hippie_2", title: "Müll-Inspektion 🗑️", description: "Erwische heute 2-mal den Mülltonnen-Hippie.", category: "hippie" as const, target: 2, rewardCoins: 2 },
  { id: "d_hippie_4", title: "Deckel-Polizei 🗑️", description: "Triff den Mülltonnen-Hippie 4-mal in der Tonne.", category: "hippie" as const, target: 4, rewardCoins: 3 }
];

export function generateDailyMissions(): Mission[] {
  const pool = [...DAILY_MISSION_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 4).map((item, idx) => ({
    id: `daily_${item.id}_${idx}`,
    title: item.title,
    description: item.description,
    category: item.category as any,
    target: item.target,
    progress: 0,
    rewardCoins: item.rewardCoins,
    completed: false,
    claimed: false,
  }));
}

export function checkAndResetDailyMissions(currentDaily?: any): DailyMissionState {
  const today = getTodayDateString();
  if (
    !currentDaily ||
    currentDaily.date !== today ||
    !Array.isArray(currentDaily.missions) ||
    currentDaily.missions.length === 0
  ) {
    return {
      date: today,
      missions: generateDailyMissions(),
    };
  }
  return currentDaily;
}
