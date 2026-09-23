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
  { id: "d_score_20k", title: "Park-Meister 🎯", description: "Sammle heute 20.000 Punkte / XP im Park.", category: "score" as const, target: 20000, rewardCoins: 3 },
  { id: "d_rounds_3", title: "Ausdauer-Spaziergang 🌳", description: "Absolviere heute 3 Runden im Park.", category: "rounds" as const, target: 3, rewardCoins: 2 },
  { id: "d_strick_2", title: "Stricknadel-Kommando 🧶", description: "Aktiviere 2-mal Omas Strick-Fieber (5er Combo).", category: "strick" as const, target: 2, rewardCoins: 2 },
  { id: "d_talahin_3", title: "Teppich-Abfang 🧞‍♀️", description: "Hol heute 3 Fliegende Talahins vom Teppich.", category: "talahin" as const, target: 3, rewardCoins: 2 },
  { id: "d_bahndidos_3", title: "Roller-Bremse 🛵", description: "Triff heute 3 Bahndidos auf dem Roller.", category: "bahndidos" as const, target: 3, rewardCoins: 2 },
  { id: "d_hippie_2", title: "Müll-Inspektion 🗑️", description: "Erwische heute 2-mal den Mülltonnen-Hippie.", category: "hippie" as const, target: 2, rewardCoins: 2 },
  { id: "d_tonnen_1", title: "Kräuterjagd 🌿", description: "Spiele heute 1-mal den Jagd-Modus.", category: "tonnen" as const, target: 1, rewardCoins: 2 },
];

export function generateDailyMissions(): Mission[] {
  const pool = [...DAILY_MISSION_POOL].sort(() => 0.5 - Math.random()).slice(0, 4);
  return pool.map((item, idx) => ({
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
  if (!currentDaily || currentDaily.date !== today || !Array.isArray(currentDaily.missions) || currentDaily.missions.length === 0) {
    return { date: today, missions: generateDailyMissions() };
  }
  return currentDaily;
}
