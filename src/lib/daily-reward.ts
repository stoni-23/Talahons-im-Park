import type { PlayerProfile } from "./profile";

export interface DailyRewardDay {
  day: number;
  label: string;
  coins: number;
  xp: number;
  badgeId?: string;
  badgeIcon?: string;
  icon: string;
}

export const DAILY_REWARD_DAYS: DailyRewardDay[] = [
  { day: 1, label: "3 Groschen", coins: 3, xp: 0, icon: "🪙" },
  { day: 2, label: "100 XP", coins: 0, xp: 100, icon: "⚡" },
  { day: 3, label: "6 Groschen", coins: 6, xp: 0, icon: "🪙" },
  { day: 4, label: "100 XP", coins: 0, xp: 100, icon: "⚡" },
  { day: 5, label: "6 Groschen + 100 XP", coins: 6, xp: 100, icon: "🎁" },
  { day: 6, label: "10 Groschen", coins: 10, xp: 0, icon: "💰" },
  {
    day: 7,
    label: "Tauben-Flüsterer (🕊️)",
    coins: 0,
    xp: 0,
    badgeId: "badge_tauben",
    badgeIcon: "🕊️",
    icon: "🕊️"
  }
];

export interface DailyRewardState {
  streak: number;
  lastClaimDate: string | null;
}

export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyRewardStatus(profile: any): {
  streak: number;
  canClaim: number | null;
  nextDayToClaim: number;
  isClaimedToday: boolean;
} {
  const rawState: DailyRewardState = profile?.dailyReward || {
    streak: 0,
    lastClaimDate: null
  };

  const todayStr = getLocalDateString();
  const lastClaimStr = rawState.lastClaimDate ? String(rawState.lastClaimDate).substring(0, 10) : null;

  // 1. Noch nie abgeholt -> Tag 1 bereit
  if (!lastClaimStr) {
    return {
      streak: 0,
      canClaim: 1,
      nextDayToClaim: 1,
      isClaimedToday: false
    };
  }

  // 2. Heute bereits abgeholt -> ABSOLUT GESPERRT!
  if (lastClaimStr === todayStr) {
    const currentStreak = Math.min(7, Math.max(1, Number(rawState.streak) || 1));
    return {
      streak: currentStreak,
      canClaim: null,
      nextDayToClaim: currentStreak >= 7 ? 1 : currentStreak + 1,
      isClaimedToday: true
    };
  }

  // 3. Kalendertage berechnen
  const todayParts = todayStr.split("-").map(Number);
  const lastParts = lastClaimStr.split("-").map(Number);
  const d1 = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const d2 = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
  const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Genau gestern abgeholt -> Nächster Tag
    const prevStreak = Number(rawState.streak) || 0;
    const nextDay = prevStreak >= 7 ? 1 : prevStreak + 1;
    return {
      streak: prevStreak,
      canClaim: nextDay,
      nextDayToClaim: nextDay,
      isClaimedToday: false
    };
  }

  // Mehr als 1 Tag her -> Streak abgerissen, Tag 1
  return {
    streak: 0,
    canClaim: 1,
    nextDayToClaim: 1,
    isClaimedToday: false
  };
}
