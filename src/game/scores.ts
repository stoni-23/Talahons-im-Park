const BOARD_KEY = "bankgeheimnis-board-v1";
const LEGACY_KEY = "bankgeheimnis-hs-v1";
const BOARD_SIZE = 10;
const SAVE_VERSION = 1;

export type ScoreEntry = {
  name: string;
  score: number;
  at: number;
};

type Save = { version: number; entries: ScoreEntry[] };

function normalizeName(raw: string) {
  const name = raw.replace(/\s+/g, " ").trim().slice(0, 16);
  return name || "Anonym";
}

export function loadBoard(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Save;
      const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
      return entries
        .filter((e) => e && typeof e.score === "number" && typeof e.name === "string")
        .sort((a, b) => b.score - a.score || a.at - b.at)
        .slice(0, BOARD_SIZE);
    }
    const legacy = Number(localStorage.getItem(LEGACY_KEY) || 0) || 0;
    if (legacy > 0) {
      const migrated: ScoreEntry[] = [{ name: "Rekord", score: legacy, at: Date.now() }];
      persist(migrated);
      return migrated;
    }
  } catch {
    /* private mode / bad JSON */
  }
  return [];
}

function persist(entries: ScoreEntry[]) {
  const save: Save = { version: SAVE_VERSION, entries };
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(save));
    const best = entries[0]?.score ?? 0;
    localStorage.setItem(LEGACY_KEY, String(best));
  } catch {
    /* ignore quota */
  }
}

export function topScore() {
  return loadBoard()[0]?.score ?? 0;
}

export function qualifies(score: number) {
  if (score <= 0) return false;
  const board = loadBoard();
  if (board.length < BOARD_SIZE) return true;
  return score > board[board.length - 1]!.score;
}

export function submitScore(name: string, score: number): ScoreEntry[] {
  if (score <= 0) return loadBoard();
  const entries = loadBoard();
  entries.push({ name: normalizeName(name), score, at: Date.now() });
  entries.sort((a, b) => b.score - a.score || a.at - b.at);
  const next = entries.slice(0, BOARD_SIZE);
  persist(next);
  return next;
}
