const SUPABASE_URL = "https://lforuvtpskrnydlburpt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";

export interface ScoreEntry {
  name: string;
  score: number;
  at?: number;
}

export function loadBoard(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem("bankgeheimnis_board");
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
      `${SUPABASE_URL}/rest/v1/highscores?select=name,score&order=score.desc&limit=10`,
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
    const mapped = data.map((d: { name: string; score: number }) => ({
      name: d.name || "Park-Besucher",
      score: Number(d.score) || 0,
      at: Date.now()
    }));
    try {
      localStorage.setItem("bankgeheimnis_board", JSON.stringify(mapped));
    } catch {}
    return mapped;
  } catch {
    return loadBoard();
  }
}

export async function submitScore(name: string, score: number): Promise<ScoreEntry[]> {
  const cleanName = (name.trim() || "Park-Besucher").slice(0, 16);
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/highscores`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ name: cleanName, score: Math.round(score) })
    });
  } catch {}
  return await fetchOnlineBoard();
}
