export interface PlayerProfile {
  name: string;
  highScore: number;
  gamesPlayed: number;
  totalHits: number;
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
    return { name: "", highScore: 0, gamesPlayed: 0, totalHits: 0 };
  }
  const data = localStorage.getItem(USER_PREFIX + currentName.toLowerCase());
  if (!data) {
    return { name: currentName, highScore: 0, gamesPlayed: 0, totalHits: 0 };
  }
  try {
    const parsed = JSON.parse(data);
    return {
      name: currentName,
      highScore: Number(parsed.highScore) || 0,
      gamesPlayed: Number(parsed.gamesPlayed) || 0,
      totalHits: Number(parsed.totalHits) || 0,
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
