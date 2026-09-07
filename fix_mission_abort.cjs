const fs = require("fs");
const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. Puffer-Ref deklarieren bei den anderen Refs (ca. Zeile 112)
if (!code.includes("pendingMissionActsRef")) {
  code = code.replace(
    /const gameOverHandledRef = useRef\(false\);/,
    `const gameOverHandledRef = useRef(false);\n  const pendingMissionActsRef = useRef<any[]>([]);`
  );
}

// 2. handleParkHit so anpassen, dass Treffer nur im Puffer gesammelt werden
const oldHitListener = /React\.useEffect\(\(\) => \{\s*const handleParkHit = \(e: any\) => \{\s*const act = e\?\.detail\?\.act;\s*if \(!act\) return;\s*setMissions\([\s\S]*?\}\);\s*\}\s*window\.addEventListener\("park_hit", handleParkHit\);[\s\S]*?\}, \[\]\);/;

const newHitListener = `React.useEffect(() => {
    const handleParkHit = (e: any) => {
      const act = e?.detail?.act;
      if (!act) return;
      // Treffer nur im Runden-Puffer sammeln - zählt noch nicht!
      pendingMissionActsRef.current.push(act);
    };
    window.addEventListener("park_hit", handleParkHit);
    return () => window.removeEventListener("park_hit", handleParkHit);
  }, []);`;

if (oldHitListener.test(code)) {
  code = code.replace(oldHitListener, newHitListener);
  console.log("✅ 1. Treffer-Event lauscht nun nur noch in den Runden-Puffer.");
} else {
  // Fallback: Direkter Tausch im Hook
  code = code.replace(
    /const handleParkHit = \(e: any\) => \{[\s\S]*?setMissions\([\s\S]*?\}\);\s*\};/,
    `const handleParkHit = (e: any) => {\n      const act = e?.detail?.act;\n      if (!act) return;\n      pendingMissionActsRef.current.push(act);\n    };`
  );
  console.log("✅ 1. Treffer-Event via Fallback in Runden-Puffer umgeleitet.");
}

// 3. Beim Start einer neuen Runde den Puffer leeren
code = code.replace(
  /if \(hud\.mode === "playing"\) \{\s*gameOverHandledRef\.current = false;/,
  `if (hud.mode === "playing") {\n      gameOverHandledRef.current = false;\n      pendingMissionActsRef.current = [];`
);

// 4. Bei hud.mode === "results" (reguläres Rundenende) die Missionen final abrechnen!
const resultsStartPattern = /if \(hud\.mode === "results"\) \{\s*if \(gameOverHandledRef\.current\) return;/;

const missionFinalEvaluation = `if (hud.mode === "results") {
      if (gameOverHandledRef.current) return;

      // Reguläres Rundenende: Jetzt und NUR jetzt Missionsfortschritt verbuchen!
      const finalActs = [...pendingMissionActsRef.current];
      pendingMissionActsRef.current = [];

      setMissions((prev) => {
        let currentMissions = prev;
        // 1. Runde abgeschlossen
        const r1 = updateMissionProgress(currentMissions, { type: "round_completed" });
        currentMissions = r1.updated;
        // 2. Erreichte Punktzahl
        const r2 = updateMissionProgress(currentMissions, { type: "score", points: hud.score || 0 });
        currentMissions = r2.updated;
        // 3. Alle Treffer der beendeten Runde
        for (const act of finalActs) {
          const rHit = updateMissionProgress(currentMissions, { type: "hit", act });
          currentMissions = rHit.updated;
        }
        try {
          localStorage.setItem("park_missions", JSON.stringify(currentMissions));
        } catch {}
        return currentMissions;
      });`;

if (code.includes('if (hud.mode === "results") {')) {
  code = code.replace(resultsStartPattern, missionFinalEvaluation);
  console.log("✅ 2. Missions-Abrechnung fest an den Results-Screen gekoppelt!");
}

fs.writeFileSync(file, code, "utf8");
console.log("✅ src/components/game-screen.tsx erfolgreich aktualisiert.");
