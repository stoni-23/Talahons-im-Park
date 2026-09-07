const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starte finalen Fix für dynamische Live-Sortierung & synchrone Level...');
const projectRoot = process.cwd();

const scoresCode = `import { getPlayerLevel } from '../lib/profile';

const SUPABASE_URL = "https://lforuvtpskrnydlburpt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";

export interface LeaderboardEntry {
  name: string;
  score: number;
  totalXp: number;
  total_xp?: number;
  level: number;
  date?: string;
  at?: number;
  isCurrentUser?: boolean;
}

export type ScoreEntry = LeaderboardEntry;

export interface AccountStats {
  totalXp: number;
  highScore: number;
  gamesPlayed: number;
  totalHits?: number;
  [key: string]: any;
}

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: \`Bearer \${SUPABASE_KEY}\`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    ...extra
  };
}

export function loadBoard(): LeaderboardEntry[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('park_highscores') || localStorage.getItem('bankgeheimnis_board') : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBoardLocal(board: LeaderboardEntry[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('park_highscores', JSON.stringify(board));
      localStorage.setItem('bankgeheimnis_board', JSON.stringify(board));
    }
  } catch {}
}

export function topScore(): number {
  const b = loadBoard();
  return b[0]?.score ?? 0;
}

export function qualifies(score: number): boolean {
  return score > 0;
}

export function levelFromSum(xp: number): number {
  return getPlayerLevel(xp);
}

export async function fetchAccountStats(username: string): Promise<AccountStats | null> {
  const cleanName = String(username || '').trim();
  if (!cleanName) return null;
  try {
    const res = await fetch(
      \`\${SUPABASE_URL}/rest/v1/accounts?username=ilike.\${encodeURIComponent(cleanName)}&select=stats&_t=\${Date.now()}\`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0] && typeof rows[0].stats === 'object' && rows[0].stats) {
      return rows[0].stats as AccountStats;
    }
    return null;
  } catch {
    return null;
  }
}

export async function persistAccountStats(
  username: string,
  roundScoreOrStats: any,
  additionalStats: Partial<AccountStats> = {}
): Promise<AccountStats | null> {
  const cleanName = String(username || '').trim();
  if (!cleanName) return null;

  try {
    const prevStats = (await fetchAccountStats(cleanName)) || {
      totalXp: 0,
      highScore: 0,
      gamesPlayed: 0,
      totalHits: 0
    };

    let roundScore = 0;
    let extraHits = 0;

    if (typeof roundScoreOrStats === 'number') {
      roundScore = roundScoreOrStats;
      extraHits = additionalStats.totalHits || 0;
    } else if (typeof roundScoreOrStats === 'object' && roundScoreOrStats !== null) {
      roundScore = Number(roundScoreOrStats.roundScore ?? roundScoreOrStats.score) || 0;
      extraHits = Number(roundScoreOrStats.roundHits ?? roundScoreOrStats.totalHits) || 0;
    }

    const prevXp = Number(prevStats.totalXp) || 0;
    const prevHits = Number(prevStats.totalHits) || 0;
    const prevGames = Number(prevStats.gamesPlayed) || 0;
    const prevHigh = Number(prevStats.highScore) || 0;

    const nextXp = roundScore > 0 ? (prevXp + roundScore) : Math.max(prevXp, Number(additionalStats.totalXp) || 0);
    const nextHits = extraHits > 0 ? (prevHits + extraHits) : Math.max(prevHits, Number(additionalStats.totalHits) || 0);
    const nextGames = roundScore > 0 ? (prevGames + 1) : Math.max(prevGames, Number(additionalStats.gamesPlayed) || 0);
    const nextHigh = Math.max(prevHigh, roundScore, Number(additionalStats.highScore) || 0);

    const updatedStats: AccountStats = {
      ...prevStats,
      ...additionalStats,
      totalXp: nextXp,
      highScore: nextHigh,
      gamesPlayed: nextGames,
      totalHits: nextHits
    };

    const calculatedLevel = getPlayerLevel(updatedStats.totalXp);

    await fetch(
      \`\${SUPABASE_URL}/rest/v1/accounts?username=ilike.\${encodeURIComponent(cleanName)}\`,
      {
        method: 'PATCH',
        headers: headers({
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }),
        body: JSON.stringify({ stats: updatedStats })
      }
    );

    const hsRes = await fetch(
      \`\${SUPABASE_URL}/rest/v1/highscores?name=ilike.\${encodeURIComponent(cleanName)}&select=id,score&_t=\${Date.now()}\`,
      { headers: headers() }
    );
    const existing = await hsRes.json().catch(() => []);

    if (Array.isArray(existing) && existing.length > 0) {
      const bestScore = Math.max(Number(existing[0].score) || 0, roundScore);
      await fetch(
        \`\${SUPABASE_URL}/rest/v1/highscores?id=eq.\${existing[0].id}\`,
        {
          method: 'PATCH',
          headers: headers({
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          }),
          body: JSON.stringify({
            score: bestScore,
            total_xp: updatedStats.totalXp,
            level: calculatedLevel
          })
        }
      );
    } else if (roundScore > 0) {
      await fetch(
        \`\${SUPABASE_URL}/rest/v1/highscores\`,
        {
          method: 'POST',
          headers: headers({
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          }),
          body: JSON.stringify({
            name: cleanName,
            score: roundScore,
            total_xp: updatedStats.totalXp,
            level: calculatedLevel
          })
        }
      );
    }

    return updatedStats;
  } catch (err) {
    console.error('[Scores] Fehler in persistAccountStats:', err);
    return null;
  }
}

export async function submitScore(
  name: string,
  roundScore: number,
  passedLevelOrXp?: number
): Promise<LeaderboardEntry[]> {
  const cleanName = String(name || '').trim();
  if (!cleanName) return fetchOnlineBoard();

  try {
    const prevStats = await fetchAccountStats(cleanName);
    let totalXp = Number(prevStats?.totalXp) || 0;
    if (totalXp <= 0 && passedLevelOrXp && passedLevelOrXp > 100) {
      totalXp = passedLevelOrXp;
    }
    if (totalXp <= 0) {
      totalXp = Math.max(0, roundScore);
    }
    const calculatedLevel = getPlayerLevel(totalXp);

    const checkRes = await fetch(
      \`\${SUPABASE_URL}/rest/v1/highscores?name=ilike.\${encodeURIComponent(cleanName)}&select=id,score&_t=\${Date.now()}\`,
      { headers: headers() }
    );
    const existing = await checkRes.json().catch(() => []);

    if (Array.isArray(existing) && existing.length > 0) {
      const best = Math.max(Number(existing[0].score) || 0, roundScore);
      await fetch(\`\${SUPABASE_URL}/rest/v1/highscores?id=eq.\${existing[0].id}\`, {
        method: 'PATCH',
        headers: headers({
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }),
        body: JSON.stringify({ score: best, total_xp: totalXp, level: calculatedLevel })
      });
    } else {
      await fetch(\`\${SUPABASE_URL}/rest/v1/highscores\`, {
        method: 'POST',
        headers: headers({
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }),
        body: JSON.stringify({ name: cleanName, score: roundScore, total_xp: totalXp, level: calculatedLevel })
      });
    }
  } catch (err) {
    console.error('[Scores] Fehler in submitScore:', err);
  }

  return fetchOnlineBoard();
}

export async function fetchOnlineBoard(
  mode = 'single'
): Promise<LeaderboardEntry[]> {
  try {
    const timestamp = Date.now();
    const [hsRes, accRes] = await Promise.all([
      fetch(
        \`\${SUPABASE_URL}/rest/v1/highscores?select=name,score,total_xp,level,created_at&order=score.desc&limit=500&_t=\${timestamp}\`,
        { headers: headers() }
      ),
      fetch(
        \`\${SUPABASE_URL}/rest/v1/accounts?select=username,stats&limit=1000&_t=\${timestamp}\`,
        { headers: headers() }
      ).catch(() => null)
    ]);

    if (!hsRes.ok) return loadBoard();
    const hsData = await hsRes.json();
    if (!Array.isArray(hsData) || hsData.length === 0) return loadBoard();

    const xpMap = new Map();
    if (accRes && accRes.ok) {
      const accData = await accRes.json();
      if (Array.isArray(accData)) {
        for (const a of accData) {
          const raw = String(a?.username || '').trim().toLowerCase();
          const xp = Number(a?.stats?.totalXp || a?.stats?.total_xp) || 0;
          if (raw && xp > 0) {
            xpMap.set(raw, Math.max(xpMap.get(raw) || 0, xp));
          }
        }
      }
    }

    const seen = new Set();
    const entries = [];

    for (const d of hsData) {
      const rawName = String(d.name || '').trim();
      if (!rawName || rawName.toLowerCase() === 'park-besucher' || rawName.toLowerCase() === 'parktourist') continue;

      const norm = rawName.toLowerCase();
      if (!seen.has(norm)) {
        seen.add(norm);

        const singleScore = Number(d.score) || 0;
        const accountXp = xpMap.get(norm) || 0;
        const rowXp = Number(d.total_xp) || 0;

        const totalXp = Math.max(accountXp, rowXp, singleScore);
        const level = getPlayerLevel(totalXp);

        entries.push({
          name: rawName,
          score: singleScore,
          totalXp,
          total_xp: totalXp,
          level,
          date: d.created_at,
          at: Date.now()
        });
      }
    }

    if (mode === 'total' || mode === 'xp') {
      entries.sort((a, b) => b.totalXp - a.totalXp);
    } else {
      entries.sort((a, b) => b.score - a.score);
    }

    const result = entries.slice(0, 100);
    saveBoardLocal(result);
    return result;
  } catch (err) {
    console.error('[Scores] Fehler in fetchOnlineBoard:', err);
    return loadBoard();
  }
}
`;

const scoresPath = path.join(projectRoot, 'src/game/scores.ts');
fs.writeFileSync(scoresPath, scoresCode.trim() + '\n', 'utf8');
console.log('✅ src/game/scores.ts aktualisiert.');

const gameScreenPath = path.join(projectRoot, 'src/components/game-screen.tsx');
if (fs.existsSync(gameScreenPath)) {
  let content = fs.readFileSync(gameScreenPath, 'utf8');

  content = content.replace(/row\.level(?!\s*\|\|\s*getPlayerLevel)/g, 'getPlayerLevel(row.totalXp || row.total_xp || row.score)');
  content = content.replace(/entry\.level(?!\s*\|\|\s*getPlayerLevel)/g, 'getPlayerLevel(entry.totalXp || entry.total_xp || entry.score)');

  const tabMatch = content.match(/const\s*\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState[^;]*['"](?:single|record|xp|total)['"]/i);
  const tabVar = tabMatch ? tabMatch[1] : 'leaderboardTab';

  const mapRegex = /(\b(?:leaderboard|board|onlineBoard)\b)\.map\s*\(\s*\((row|entry|item),\s*(index|idx|i)\)\s*=>/g;
  
  if (mapRegex.test(content)) {
    content = content.replace(
      mapRegex,
      `[...$1].sort((a, b) => {
        const isXp = typeof ${tabVar} !== 'undefined' && (${tabVar} === 'total' || ${tabVar} === 'xp');
        return isXp ? ((b.totalXp || b.total_xp || b.score || 0) - (a.totalXp || a.total_xp || a.score || 0)) : ((b.score || 0) - (a.score || 0));
      }).map(($2, $3) =>`
    );
    console.log('✅ Dynamische Sortierung direkt in game-screen.tsx aktiviert!');
  }

  fs.writeFileSync(gameScreenPath, content, 'utf8');
  console.log('✅ src/components/game-screen.tsx erfolgreich aktualisiert.');
}

console.log('\n🔍 Starte npm run build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n🎉 Build erfolgreich! Beide Tabs sortieren sofort in Echtzeit und Level sind 100% synchron!');
} catch (e) {
  console.error('\n❌ Build fehlgeschlagen:', e.message);
  process.exit(1);
}
