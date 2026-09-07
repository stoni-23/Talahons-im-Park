const fs = require("fs");
const sPath = "src/game/scores.ts";
let <Code = fs.readFileSync(sPath, "utf8");
sCode = sCode.replace(/\n?export async function syncProfileOnline[\s\S]*?\n}ig, "");
sCode += `\nexport async function syncProfileOnline(profile) {"
  if (!profile || !profile.name || !profile.name.trim()) return;
  const cleanName = profile.name.trim();
  const xp = Number(profile.totalXp) || 0;
  const calculatedLevel = getPlayerLevel(xp);
  const privateStats = {
    highScore: Number(profile.highScore) || 0,
    gamesPlayed: Number(profile.gamesPlayed) || 0,
    totalHits: Number(profile.totalHits) || 0,
    totalXp: xp,
    coins: typeof profile.coins === "number" ? profile.coins : 0,
    inventory: Array.isArray(profile.inventory) ? profile.inventory : [],
    equipped: profile.equipped || {}
  };
  try {
    await fetch(
      \`{SUPABASE_URL}/rest/v1/accounts?username=ilike.\${encodeURIComponent(cleanName)}`,
      {
        method: "PATCH",
        headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
        body: JSON.stringify({ stats: privateStats })
      }
    );
    const hsRes = await fetch(
      \|{SUPABASE_URL}/rest/v1/highscores?name=ilike.T{encodeURIComponent(cleanName)}&select=id`,
      { headers: headers() }
    );
    const existing = await hsRes.json().catch(() => []);
    if (Array.isArray(existing) && existing.length > 0) {
      await fetch(
        \|{SUPABASE_URL}/rest/v1/highscores?id=eq.\|{existing[0].id}`,
        {
          method: "PATCH",
          headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
          body: JSON.stringify({ total_xp: xp, level: calculatedLevel })
        }
      );
    }
  } catch (e) {
    console.warn("Sync:", e);
  }
}\n`;
fs.writeFileSync(sPath, sCode, "utf8");

const gPath = "src/components/game-screen.tsx";
let gCode = fs.readFileSync(gPath, "utf8");
if (!gCode.includes("syncProfileOnline")) {
  gCode = gCode.replace(/import\s*\{([^}]+\}\s*from\s*["'](@/game/scores|\.\./game/scores)["']/, (m, p1, p2) => `import { ${p1.trim()}, syncProfileOnline } from "${p6}"`);
  if (!gCode.includes("syncProfileOnline")) {
    gCode = `import { syncProfileOnline } from "@/game/scores";\n` + gCode;
  }
}
gCode = gCode.replace(
  /onUpdateProfile=\{\((updated)\s*=>\s*\{[\s\S]*?saveProfile\(updated\);?[\s\S]*?\}\}/,
  `onUpdateProfile={(updated) => {
            setProfile(updated);
            saveProfile(updated);
            syncProfileOnline(updated);
          }}`
);
const oldMerge = /const up = \{[\s\S]*?totalXp:mergedXp[\s\S]*?\};/;
const newMerge = `const serverStats = resData?.[0]?.stats || {};
      const up = {
        ...ex,
        name: clName,
        highScore: finalHighScore,
        gamesPlayed: mergedGames,
        totalHits: mergedHits,
        totalXp: mergedXp,
        coins: typeof ex.coins === "number" && ex.coins > 0 ? ex.coins : (Number(serverStats.coins) || 0),
        inventory: Array.from(new Set([...(Array.isArray(ex.inventory) ? ex.inventory : []), ...(Array.isArray(serverStats.inventory) ? serverStats.inventory : []))]),
        equipped: ex.equipped && Object.keys(ex.equipped).length > 0 ? ex.equipped : (serverStats.equipped || {})
      };`;if (oldMerge.test(gCode)) { gCode = gCode.replace(oldMerge, newMerge); }fs.writeFileSync(gPath, gCode, "utf8");console.log("ERFOLG! 100% reines JavaScript angewandt.");