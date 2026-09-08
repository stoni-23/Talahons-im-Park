import { getPlayerLevel } from '../lib/profile';

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
  gamesPlayed?: number;
  totalHits?: number;
  equipped?: Record<string, string>;
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
    Authorization: `Bearer ${SUPABASE_KEY}`,
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
      `${SUPABASE_URL}/rest/v1/accounts?username=ilike.${encodeURIComponent(cleanName)}&select=stats`,
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
    let explicitXp = 0;
    let explicitHigh = 0;
    let explicitGames = 0;

    if (typeof roundScoreOrStats === 'number') {
      roundScore = roundScoreOrStats;
      extraHits = additionalStats.totalHits || 0;
    } else if (typeof roundScoreOrStats === 'object' && roundScoreOrStats !== null) {
      roundScore = Number(roundScoreOrStats.roundScore ?? roundScoreOrStats.score) || 0;
      extraHits = Number(roundScoreOrStats.roundHits ?? roundScoreOrStats.totalHits) || 0;
      explicitXp = Number(roundScoreOrStats.totalXp ?? roundScoreOrStats.total_xp) || 0;
      explicitHigh = Number(roundScoreOrStats.highScore) || 0;
      explicitGames = Number(roundScoreOrStats.gamesPlayed) || 0;
    }

    const prevXp = Number(prevStats.totalXp) || 0;
    const prevHits = Number(prevStats.totalHits) || 0;
    const prevGames = Number(prevStats.gamesPlayed) || 0;
    const prevHigh = Number(prevStats.highScore) || 0;

    const nextXp = explicitXp > 0 
      ? Math.max(prevXp, explicitXp) 
      : (roundScore > 0 ? prevXp + roundScore : Math.max(prevXp, Number(additionalStats.totalXp) || 0));

    const nextHits = extraHits > 0 ? (prevHits + extraHits) : Math.max(prevHits, Number(additionalStats.totalHits) || 0);
    const nextGames = explicitGames > 0 ? Math.max(prevGames, explicitGames) : (roundScore > 0 ? prevGames + 1 : Math.max(prevGames, Number(additionalStats.gamesPlayed) || 0));
    const nextHigh = Math.max(prevHigh, roundScore, explicitHigh, Number(additionalStats.highScore) || 0);

    const updatedStats: AccountStats = {
      ...prevStats,
      ...additionalStats,
      ...(typeof roundScoreOrStats === 'object' ? roundScoreOrStats : {}),
      totalXp: nextXp,
      highScore: nextHigh,
      gamesPlayed: nextGames,
      totalHits: nextHits
    };

    const calculatedLevel = getPlayerLevel(updatedStats.totalXp);

    await fetch(
      `${SUPABASE_URL}/rest/v1/accounts?username=ilike.${encodeURIComponent(cleanName)}`,
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
      `${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(cleanName)}&select=id,score`,
      { headers: headers() }
    );
    const existing = await hsRes.json().catch(() => []);

    if (Array.isArray(existing) && existing.length > 0) {
      const bestScore = Math.max(Number(existing[0].score) || 0, roundScore, nextHigh);
      await fetch(
        `${SUPABASE_URL}/rest/v1/highscores?id=eq.${existing[0].id}`,
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
    } else {
      await fetch(
        `${SUPABASE_URL}/rest/v1/highscores`,
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
      `${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(cleanName)}&select=id,score`,
      { headers: headers() }
    );
    const existing = await checkRes.json().catch(() => []);

    if (Array.isArray(existing) && existing.length > 0) {
      const best = Math.max(Number(existing[0].score) || 0, roundScore);
      await fetch(`${SUPABASE_URL}/rest/v1/highscores?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers: headers({
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }),
        body: JSON.stringify({ score: best, total_xp: totalXp, level: calculatedLevel })
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/highscores`, {
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
        `${SUPABASE_URL}/rest/v1/accounts?select=username,stats&limit=1000`,
        { headers: headers() }
      ).catch(() => null),
      fetch(
        `${SUPABASE_URL}/rest/v1/highscores?select=name,score,total_xp,level,created_at&limit=1000`,
        { headers: headers() }
      ).catch(() => null)
    ]);

    const playerMap = new Map<string, LeaderboardEntry>();

    if (accRes && accRes.ok) {
      const accounts = await accRes.json().catch(() => []);
      if (Array.isArray(accounts)) {
        for (const acc of accounts) {
          const rawName = String(acc?.username || '').trim();
          if (!rawName || rawName.toLowerCase() === 'park-besucher' || rawName.toLowerCase() === 'parktourist') continue;

          const totalXp = Number(acc?.stats?.totalXp || acc?.stats?.total_xp) || 0;
          const highScore = Number(acc?.stats?.highScore || acc?.stats?.score) || 0;
          const gamesPlayed = Number(acc?.stats?.gamesPlayed) || 0;
          const totalHits = Number(acc?.stats?.totalHits) || 0;
          const equipped = acc?.stats?.equipped || {};

          if (totalXp <= 0 && highScore <= 0 && gamesPlayed <= 0) continue;

          const norm = rawName.toLowerCase();
          const effectiveXp = Math.max(totalXp, highScore);
          const level = getPlayerLevel(effectiveXp);

          playerMap.set(norm, {
            name: rawName,
            score: highScore,
            totalXp: effectiveXp,
            total_xp: effectiveXp,
            level,
            at: Date.now(),
            gamesPlayed,
            totalHits,
            equipped
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
            const existing = playerMap.get(norm)!;
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

    const entries = Array.from(playerMap.values()).filter(p => {
      const xp = Number(p.totalXp || p.total_xp || 0);
      const sc = Number(p.score || 0);
      if (mode === "total" || mode === "xp") {
        return xp > 0;
      }
      return sc > 0 || xp > 0;
    });

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
export async function syncProfileOnline(p){if(!p?.name?.trim())return;const n=p.name.trim(),x=Number(p.totalXp)||0,l=getPlayerLevel(x),s={highScore:Number(p.highScore)||0,gamesPlayed:Number(p.gamesPlayed)||0,totalHits:Number(p.totalHits)||0,totalXp:x,coins:Number(p.coins)||0,inventory:Array.isArray(p.inventory)?p.inventory:[],equipped:p.equipped||{},missions: p.missions || [],
    dailyReward: p.dailyReward || null,dailyReward:p.dailyReward||null};try{await fetch(`${SUPABASE_URL}/rest/v1/accounts?username=ilike.${encodeURIComponent(n)}`,{method:"PATCH",headers:headers({"Content-Type":"application/json",Prefer:"return=minimal"}),body:JSON.stringify({stats:s})});const r=await fetch(`${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(n)}&select=id`,{headers:headers()});const d=await r.json().catch(()=>[]);if(d?.[0]?.id)await fetch(`${SUPABASE_URL}/rest/v1/highscores?id=eq.${d[0].id}`,{method:"PATCH",headers:headers({"Content-Type":"application/json",Prefer:"return=minimal"}),body:JSON.stringify({total_xp:x,level:l})});}catch(e){}}
