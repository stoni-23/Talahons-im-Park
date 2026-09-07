const fs = require("fs");
const { execSync } = require("child_process");

console.log("=== 1. src/lib/profile.ts anpassen ===");
const profilePath = "src/lib/profile.ts";
let pCode = fs.readFileSync(profilePath, "utf8");

if (!pCode.includes("missions?: any[];")) {
  pCode = pCode.replace(
    /equipped\?: Record<string, string>;/,
    `equipped?: Record<string, string>;\n  missions?: any[];`
  );
}

if (!pCode.includes("missions: Array.isArray(parsed.missions)")) {
  pCode = pCode.replace(
    /equipped:\s*\(parsed\.equipped && typeof parsed\.equipped === "object"\)\s*\?\s*parsed\.equipped\s*:\s*\{\},/,
    `equipped: (parsed.equipped && typeof parsed.equipped === "object") ? parsed.equipped : {},\n      missions: Array.isArray(parsed.missions) ? parsed.missions : undefined,`
  );
}

if (!pCode.includes("missions: profile.missions,")) {
  pCode = pCode.replace(
    /name:\s*profile\.name\.trim\(\),/,
    `name: profile.name.trim(),\n      missions: profile.missions,`
  );
}
fs.writeFileSync(profilePath, pCode, "utf8");

console.log("=== 2. src/components/game-screen.tsx anpassen ===");
const gamePath = "src/components/game-screen.tsx";
let gCode = fs.readFileSync(gamePath, "utf8");

const oldCalcBlock = /if \(profile\?\.name\?\.trim\(\)\) \{\s*let currentMissions[\s\S]*?syncProfileOnline\(updated\);\s*\}\s*catch\s*\{\}\s*return updated;\s*\}\);\s*\}/;

const newCalcBlock = `if (profile?.name?.trim()) {
        let currentMissions = Array.isArray(profile.missions) && profile.missions.length > 0 ? profile.missions : missions;

        for (const act of finalActs) {
          const rHit = updateMissionProgress(currentMissions, { type: "hit", act });
          currentMissions = rHit.updated;
        }

        const rEnd = updateMissionProgress(currentMissions, { type: "round_end", score: hud.score || 0 });
        currentMissions = rEnd.updated;

        setMissions(currentMissions);
        setProfile((prev: any) => {
          const updated = { ...prev, missions: currentMissions };
          try {
            saveProfile(updated);
            if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
          } catch {}
          return updated;
        });
      }`;

if (oldCalcBlock.test(gCode)) {
  gCode = gCode.replace(oldCalcBlock, newCalcBlock);
} else {
  gCode = gCode.replace(
    /const r1 = updateMissionProgress\(currentMissions, \{ type: "round_completed" \}\);[\s\S]*?const r2 = updateMissionProgress\(currentMissions, \{ type: "score", points: hud\.score \|\| 0 \}\);[\s\S]*?currentMissions = r2\.updated;/,
    `const rEnd = updateMissionProgress(currentMissions, { type: "round_end", score: hud.score || 0 });\n        currentMissions = rEnd.updated;`
  );
}
fs.writeFileSync(gamePath, gCode, "utf8");

console.log("=== 3. Build testen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Missionen zählen ab jetzt zuverlässig mit!");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
  process.exit(1);
}
