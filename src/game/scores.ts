const SUPABASE_URL = "https://lforuvtpskrnydlburpt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";

export interface ScoreEntry {
  name: string;
  score: number;
  at?: number;
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
      `${SUPABASE_URL}/rest/v1/highscores?select=name,score&order=score.desc&limit=500`,
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
        mapped.push({ name, score, at: Date.now() });
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

export async function submitScore(name: string, score: number): Promise<ScoreEntry[]> {
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
      body: JSON.stringify({ name: cleanName, score: finalScore })
    });
  } catch {}
  return await fetchOnlineBoard();
}
