export interface PlayerProfile {
  name: string;
  highScore: number;
  gamesPlayed: number;
  totalHits: number;
  totalXp: number;
}

export function getPlayerLevel(xp: number): number {
  if (!xp || xp <= 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(xp / 2500)) + 1);
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
    const bestScore = Math.max(0, Number(parsed.highScore) || 0);
    const rawXp = Math.max(0, Number(parsed.totalXp) || 0);
    const resolvedXp = Math.max(rawXp, bestScore);

    return {
      name: currentName,
      highScore: bestScore,
      gamesPlayed: Math.max(0, Number(parsed.gamesPlayed) || 0),
      totalHits: Math.max(0, Number(parsed.totalHits) || 0),
      totalXp: resolvedXp,
    };
  } catch {
    return { name: currentName, highScore: 0, gamesPlayed: 0, totalHits: 0, totalXp: 0 };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined" || !profile.name.trim()) return;
  setActiveUserName(profile.name);
  const bestScore = Math.max(0, profile.highScore || 0);
  const resolvedXp = Math.max(0, profile.totalXp || 0, bestScore);
  localStorage.setItem(
    USER_PREFIX + profile.name.trim().toLowerCase(),
    JSON.stringify({
      name: profile.name.trim(),
      highScore: bestScore,
      gamesPlayed: Math.max(0, profile.gamesPlayed || 0),
      totalHits: Math.max(0, profile.totalHits || 0),
      totalXp: resolvedXp,
    })
  );
}

export function resetCurrentProfile(): void {
  if (typeof window === "undefined") return;
  const currentName = getActiveUserName();
  if (currentName) {
    localStorage.removeItem(USER_PREFIX + currentName.toLowerCase());
  }
  localStorage.removeItem(ACTIVE_USER_KEY);
}
