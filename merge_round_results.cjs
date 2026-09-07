const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

console.log("=== 1. Backup erstellen ===");
fs.writeFileSync(file + ".pre_merge_bak", code, "utf8");

console.log("=== 2. hud.mode === 'results' Block zusammenführen ===");
const oldBlockRegex = /if \(hud\.mode === "results"\) \{\s*if \(gameOverHandledRef\.current\) return;[\s\S]*?return \(\) => window\.clearTimeout\(t\);/;

const unifiedBlock = `if (hud.mode === "results") {
      if (gameOverHandledRef.current) return;

      const finalActs = [...pendingMissionActsRef.current];
      pendingMissionActsRef.current = [];

      setResultsDelay(true);
      const t = window.setTimeout(() => setResultsDelay(false), 2000);

      const activeName = profile?.name?.trim() || "";
      if (activeName) {
        gameOverHandledRef.current = true;
        const p = loadProfile(activeName);

        // 1. Missionen präzise aktualisieren
        let currentMissions = Array.isArray(p.missions) && p.missions.length > 0
          ? p.missions
          : (Array.isArray(profile.missions) && profile.missions.length > 0 ? profile.missions : missions);

        for (const act of finalActs) {
          const rHit = updateMissionProgress(currentMissions, { type: "hit", act });
          currentMissions = rHit.updated;
        }

        const rEnd = updateMissionProgress(currentMissions, { type: "round_end", score: hud.score || 0 });
        currentMissions = rEnd.updated;

        // 2. Stats (XP, Hits, Games, Highscore) wie gewohnt berechnen
        p.gamesPlayed = (p.gamesPlayed || 0) + 1;
        p.totalHits = (p.totalHits || 0) + hud.hits;
        p.totalXp = (p.totalXp || 0) + hud.score;
        if (hud.score > p.highScore) p.highScore = hud.score;
        p.missions = currentMissions;

        // 3. Alles in einem Rutsch speichern und State aktualisieren
        saveProfile(p);
        setMissions(currentMissions);
        setProfile(p);

        try {
          if (typeof syncProfileOnline === "function") syncProfileOnline(p);
        } catch {}

        persistAccountStats(activeName, {
          gamesPlayed: p.gamesPlayed,
          totalHits: p.totalHits,
          totalXp: p.totalXp,
          highScore: p.highScore,
          roundScore: hud.score,
          roundHits: hud.hits
        }).catch(() => {});

        setNamed(true);
        setName(activeName);
        if (p.highScore > 0 || hud.score > 0) {
          submitScore(activeName, Math.max(p.highScore || 0, hud.score || 0), getPlayerLevel(p.totalXp || 0)).then((up) => {
            if (up && up.length > 0) setBoard(up);
          });
        } else {
          fetchOnlineBoard().then((data) => {
            if (data && data.length > 0) setBoard(data);
          });
        }
      } else {
        setNamed(!qualifies(hud.score));
        fetchOnlineBoard().then((data) => {
          if (data && data.length > 0) setBoard(data);
        });
      }

      return () => window.clearTimeout(t);`;

if (oldBlockRegex.test(code)) {
  code = code.replace(oldBlockRegex, unifiedBlock);
  console.log("  [+] Rundenabrechnung wurde erfolgreich zusammengeführt.");
  fs.writeFileSync(file, code, "utf8");
} else {
  console.error("  [!] Konnte den Block nicht exakt per Regex matchen.");
  process.exit(1);
}

console.log("=== 3. Vite Build testen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Abrechnung ist jetzt ein einziger sauberer Ablauf! Missionen werden nicht mehr überschrieben.");
} catch (err) {
  console.error("Fehler beim Build. Stelle Backup wieder her...", err.message);
  fs.copyFileSync(file + ".pre_merge_bak", file);
  process.exit(1);
}
