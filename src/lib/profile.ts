export interface PlayerProfile {
  name: string;
  highScore: number;
  gamesPlayed: number;
  totalHits: number;
  totalXp: number;
}

export function getLevelProgress(xp: number) {
  const currentXp = Math.max(0, xp || 0);
  const level = getPlayerLevel(currentXp);
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 2500;
  const nextLevelBaseXp = Math.pow(level, 2) * 2500;
  const needed = nextLevelBaseXp - currentLevelBaseXp;
  const progressInLevel = currentXp - currentLevelBaseXp;
  const percent = Math.min(100, Math.max(0, Math.floor((progressInLevel / needed) * 100)));
  return { level, currentXp, currentLevelBaseXp, nextLevelBaseXp, progressInLevel, needed, percent };
}

export function getPlayerLevel(xp: number): number {
  if (!xp || xp <= 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(xp / 2500)) + 1);
}

const ACTIVE_USER_KEY = "bankgeheimnis_active_user";
const USER_PREFIX = "bankgeheimnis_user_";

export function getActiveUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACTIVE_USER_KEY) || "";
}

export function setActiveUserName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_USER_KEY, name.trim());
}

export function loadProfile(name?: string): PlayerProfile {
  const currentName = name !== undefined ? name.trim() : getActiveUserName();
  if (!currentName || typeof window === "undefined") {
    return { name: "", highScore: 0, gamesPlayed: 0, totalHits: 0, totalXp: 0 };
  }
  const data = localStorage.getItem(USER_PREFIX + currentName.toLowerCase());
  if (!data) {
    return { name: currentName, highScore: 0, gamesPlayed: 0, totalHits: 0, totalXp: 0 };
  }
  try {
    const parsed = JSON.parse(data);
    return {
      name: currentName,
      highScore: Number(parsed.highScore) || 0,
      gamesPlayed: Number(parsed.gamesPlayed) || 0,
      totalHits: Number(parsed.totalHits) || 0,
      totalXp: Number(parsed.totalXp) || Number(parsed.highScore) || 0,
    };
  } catch {
    return { name: currentName, highScore: 0, gamesPlayed: 0, totalHits: 0 };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined" || !profile.name.trim()) return;
  setActiveUserName(profile.name);
  localStorage.setItem(
    USER_PREFIX + profile.name.trim().toLowerCase(),
    JSON.stringify({
      name: profile.name.trim(),
      highScore: Math.max(0, profile.highScore),
      gamesPlayed: Math.max(0, profile.gamesPlayed),
      totalHits: Math.max(0, profile.totalHits),
      totalXp: Math.max(0, profile.totalXp || 0),
    })
  );
}

export function resetCurrentProfile(): PlayerProfile {
  const currentName = getActiveUserName();
  if (typeof window !== "undefined") {
    if (currentName) {
      localStorage.removeItem(USER_PREFIX + currentName.toLowerCase());
    }
    localStorage.removeItem(ACTIVE_USER_KEY);
    localStorage.removeItem("bankgeheimnis_profile");
  }
  return { name: "", highScore: 0, gamesPlayed: 0, totalHits: 0 };
}
