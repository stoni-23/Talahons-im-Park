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

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
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

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const lastClaim = rawState.lastClaimDate;

  if (lastClaim === today) {
    return {
      streak: rawState.streak,
      canClaim: null,
      nextDayToClaim: (rawState.streak % 7) + 1,
      isClaimedToday: true
    };
  }

  if (lastClaim === yesterday) {
    const nextDay = rawState.streak >= 7 ? 1 : rawState.streak + 1;
    return {
      streak: rawState.streak >= 7 ? 0 : rawState.streak,
      canClaim: nextDay,
      nextDayToClaim: nextDay,
      isClaimedToday: false
    };
  }

  return {
    streak: 0,
    canClaim: 1,
    nextDayToClaim: 1,
    isClaimedToday: false
  };
}

export function claimDailyReward(profile: PlayerProfile): {
  updatedProfile: PlayerProfile;
  claimedDay: DailyRewardDay;
} {
  const status = getDailyRewardStatus(profile);
  if (!status.canClaim) {
    throw new Error("Heute bereits abgeholt!");
  }

  const dayNumber = status.canClaim;
  const reward = DAILY_REWARD_DAYS.find((d) => d.day === dayNumber)!;
  const today = getTodayString();

  const nextStreak = dayNumber;
  const nextCoins = (profile.coins || 0) + reward.coins;
  const nextXp = (profile.totalXp || 0) + reward.xp;

  const currentInventory = Array.isArray(profile.inventory)
    ? [...profile.inventory]
    : [];

  const currentEquipped = { ...(profile.equipped || {}) };

  if (reward.badgeId) {
    if (!currentInventory.includes(reward.badgeId)) {
      currentInventory.push(reward.badgeId);
    }
    currentEquipped.badge = reward.badgeId;
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    coins: nextCoins,
    totalXp: nextXp,
    inventory: currentInventory,
    equipped: currentEquipped,
    ...({
      dailyReward: {
        streak: nextStreak,
        lastClaimDate: today
      }
    } as any)
  };

  return { updatedProfile, claimedDay: reward };
}
