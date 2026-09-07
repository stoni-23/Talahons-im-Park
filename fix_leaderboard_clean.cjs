const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starte finale Bereinigung der Bestenliste...');
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
      \`\${SUPABASE_URL}/rest/v1/accounts?username=ilike.\${encodeURIComponent(cleanName)}&select=stats\`,
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
      \`\${SUPABASE_URL}/rest/v1/highscores?name=ilike.\${encodeURIComponent(cleanName)}&select=id,score\`,
      { headers: headers() }
    );
    const existing = await hsRes.json().catch(() => []);

    if (Array.isArray(existing) && existing.length > 0) {
      const bestScore = Math.max(Number(existing[0].score) || 0, roundScore, nextHigh);
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
    } else if (nextHigh > 0 || nextXp > 0) {
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
            score: Math.max(roundScore, nextHigh),
            total_xp: updatedStats.totalXp,
            level: calculatedLevel
          })
        }
      );
    }

    return updatedStats;
  } catch (err) {
    console.error('[Scores] persistAccountStats Fehler:', err);
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
      \`\${SUPABASE_URL}/rest/v1/highscores?name=ilike.\${encodeURIComponent(cleanName)}&select=id,score\`,
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
    console.error('[Scores] submitScore Fehler:', err);
  }

  return fetchOnlineBoard();
}

export async function fetchOnlineBoard(
  mode = 'single'
): Promise<LeaderboardEntry[]> {
  try {
    const [accRes, hsRes] = await Promise.all([
      fetch(
        \`\${SUPABASE_URL}/rest/v1/accounts?select=username,stats&limit=1000\`,
        { headers: headers() }
      ).catch(() => null),
      fetch(
        \`\${SUPABASE_URL}/rest/v1/highscores?select=name,score,total_xp,level,created_at&limit=1000\`,
        { headers: headers() }
      ).catch(() => null)
    ]);

    const playerMap = new Map();

    if (accRes && accRes.ok) {
      const accounts = await accRes.json().catch(() => []);
      if (Array.isArray(accounts)) {
        for (const acc of accounts) {
          const rawName = String(acc?.username || '').trim();
          if (!rawName || rawName.toLowerCase() === 'park-besucher' || rawName.toLowerCase() === 'parktourist') continue;

          const totalXp = Number(acc?.stats?.totalXp || acc?.stats?.total_xp) || 0;
          const highScore = Number(acc?.stats?.highScore || acc?.stats?.score) || 0;
          const gamesPlayed = Number(acc?.stats?.gamesPlayed) || 0;

          if (totalXp <= 0 && highScore <= 0 && gamesPlayed <= 0) {
            continue;
          }

          const norm = rawName.toLowerCase();
          const level = getPlayerLevel(totalXp > 0 ? totalXp : highScore);

          playerMap.set(norm, {
            name: rawName,
            score: highScore,
            totalXp: Math.max(totalXp, highScore),
            total_xp: Math.max(totalXp, highScore),
            level,
            at: Date.now()
          });
        }
      }
    }

    if (hsRes && hsRes.ok) {
      const highscores = await hsRes.json().catch(() => []);
      if (Array.isArray(highscores)) {
        for (const hs of highscores) {
          const rawName = String(hs?.name || '').trim();
          if (!rawName || rawName.toLowerCase() === 'park-besucher' || rawName.toLowerCase() === 'parktourist') continue;

          const score = Number(hs.score) || 0;
          const rowXp = Number(hs.total_xp) || 0;

          if (score <= 0 && rowXp <= 0) continue;

          const norm = rawName.toLowerCase();

          if (playerMap.has(norm)) {
            const existing = playerMap.get(norm);
            existing.score = Math.max(existing.score, score);
            existing.totalXp = Math.max(existing.totalXp, rowXp, existing.score);
            existing.total_xp = existing.totalXp;
            existing.level = getPlayerLevel(existing.totalXp);
            if (hs.created_at) existing.date = hs.created_at;
          } else {
            const totalXp = Math.max(rowXp, score);
            playerMap.set(norm, {
              name: rawName,
              score,
              totalXp,
              total_xp: totalXp,
              level: getPlayerLevel(totalXp),
              date: hs.created_at,
              at: Date.now()
            });
          }
        }
      }
    }

    const entries = Array.from(playerMap.values());

    if (mode === 'total' || mode === 'xp') {
      entries.sort((a, b) => {
        const diff = (b.totalXp || 0) - (a.totalXp || 0);
        return diff !== 0 ? diff : (b.score || 0) - (a.score || 0);
      });
    } else {
      entries.sort((a, b) => {
        const diff = (b.score || 0) - (a.score || 0);
        return diff !== 0 ? diff : (b.totalXp || 0) - (a.totalXp || 0);
      });
    }

    const result = entries.slice(0, 100);
    if (result.length > 0) {
      saveBoardLocal(result);
    }
    return result;
  } catch (err) {
    console.error('[Scores] Fehler in fetchOnlineBoard:', err);
    return loadBoard();
  }
}
`;

const scoresPath = path.join(projectRoot, 'src/game/scores.ts');
fs.writeFileSync(scoresPath, scoresCode.trim() + '\n', 'utf8');
console.log('✅ src/game/scores.ts bereinigt.');

try {
  execSync('git checkout src/components/game-screen.tsx', { stdio: 'inherit' });
  console.log('✅ src/components/game-screen.tsx auf sauberen Originalstand gesetzt.');
} catch (e) {}

const gameScreenPath = path.join(projectRoot, 'src/components/game-screen.tsx');
if (fs.existsSync(gameScreenPath)) {
  let content = fs.readFileSync(gameScreenPath, 'utf8');
  let changed = false;

  const staticLevelRegex = /row\.level(?!\s*\|\|\s*getPlayerLevel)/g;
  if (staticLevelRegex.test(content)) {
    content = content.replace(staticLevelRegex, '(row.level || getPlayerLevel(row.totalXp || row.score))');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(gameScreenPath, content, 'utf8');
    console.log('✅ src/components/game-screen.tsx synchronisiert.');
  }
}

console.log('\n🔍 Starte npm run build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n🎉 Build erfolgreich!');
} catch (e) {
  console.error('\n❌ Build fehlgeschlagen:', e.message);
  process.exit(1);
}
