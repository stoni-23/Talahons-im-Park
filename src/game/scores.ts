const SUPABASE_URL = "https://lforuvtpskrnydlburpt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";

export interface ScoreEntry {
  name: string;
  score: number;
  at?: number;
  level?: number;
}

export function loadBoard(): ScoreEntry[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("bankgeheimnis_board") : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function topScore(): number {
  const b = loadBoard();
  return b[0]?.score ?? 0;
}

export function qualifies(score: number): boolean {
  return score > 0;
}

export async function fetchOnlineBoard(): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/highscores?select=name,score,level&order=score.desc&limit=500`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (!res.ok) return loadBoard();
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return loadBoard();

    const seenNames = new Set<string>();
    const mapped: ScoreEntry[] = [];

    for (const d of data) {
      const name = (d.name || "").trim();
      if (!name || name.toLowerCase() === "park-besucher" || name.toLowerCase() === "parktourist") continue;

      const score = Number(d.score) || 0;
      const key = name.toLowerCase();

      if (!seenNames.has(key)) {
        seenNames.add(key);
        mapped.push({ name, score, level: Number(d.level) || 1, at: Date.now() });
      }

      if (mapped.length >= 100) break;
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bankgeheimnis_board", JSON.stringify(mapped));
      }
    } catch {}
    return mapped;
  } catch {
    return loadBoard();
  }
}


export async function syncPlayerLevel(name: string, level: number): Promise<void> {
  const cleanName = name.trim().slice(0, 16);
  const lvl = Math.max(1, Math.round(level));
  if (!cleanName || lvl <= 1) return; // Verhindert strikt das Überschreiben mit Level 1!
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(cleanName)}&level=lt.${lvl}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ level: lvl })
    });
  } catch {}
}

export async function submitScore(name: string, score: number, level: number = 1): Promise<ScoreEntry[]> {
  const cleanName = name.trim().slice(0, 16);
  const finalScore = Math.round(score);

  if (!cleanName || finalScore <= 0) return await fetchOnlineBoard();

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/highscores`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ name: cleanName, score: finalScore, level: Math.max(1, Math.round(level)) })
    });
    // Kein Down-Patching mehr
  } catch {}
  return await fetchOnlineBoard();
}
