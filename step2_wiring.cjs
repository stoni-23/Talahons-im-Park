const fs = require("fs");
const { execSync } = require("child_process");

console.log("=== 1. Treffer-Event in src/game/engine.ts einhängen ===");
const enginePath = "src/game/engine.ts";
let engineCode = fs.readFileSync(enginePath, "utf8");

const hitDispatch = 'if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("park_hit", { detail: { act: t.act } }));';
if (!engineCode.includes("park_hit")) {
  engineCode = engineCode.replace(
    /(playHit\(this\.combo\);[\s\S]*?if \(t\.act === "oma"\) \{)/,
    `${hitDispatch}\n    $1`
  );
  fs.writeFileSync(enginePath, engineCode, "utf8");
  console.log("  [+] Treffer-Event park_hit in engine.ts aktiv.");
} else {
  console.log("  [+] Treffer-Event war bereits vorhanden.");
}

console.log("=== 2. Event-Listener in src/components/game-screen.tsx einhängen ===");
const scrPath = "src/components/game-screen.tsx";
let scrCode = fs.readFileSync(scrPath, "utf8");

if (!scrCode.includes("updateMissionProgress")) {
  scrCode = scrCode.replace(
    'import { INITIAL_MISSIONS, type Mission } from "@/lib/missions";',
    'import { INITIAL_MISSIONS, updateMissionProgress, type Mission } from "@/lib/missions";'
  );
}

const listenerBlock = `
  React.useEffect(() => {
    const handleParkHit = (e: any) => {
      const act = e?.detail?.act;
      if (!act) return;
      setMissions((prev) => {
        const { updated, changed } = updateMissionProgress(prev, { type: "hit", act });
        if (changed) {
          try { localStorage.setItem("park_missions", JSON.stringify(updated)); } catch {}
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener("park_hit", handleParkHit);
    return () => window.removeEventListener("park_hit", handleParkHit);
  }, []);
`;

if (!scrCode.includes("handleParkHit")) {
  scrCode = scrCode.replace(
    /(const \[missions, setMissions\] = React\.useState<Mission\[\]>[\s\S]*?\}\);)/,
    `$1\n${listenerBlock}`
  );
  fs.writeFileSync(scrPath, scrCode, "utf8");
  console.log("  [+] Missions-Listener in game-screen.tsx aktiv.");
} else {
  console.log("  [+] Missions-Listener war bereits vorhanden.");
}

console.log("\nStarte Vite-Build...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Bahndidos, fliegende Talahin & Hippie zählen jetzt live im Spiel!");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
  process.exit(1);
}
