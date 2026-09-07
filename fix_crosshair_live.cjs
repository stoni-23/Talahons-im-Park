const fs = require("fs");
const { execSync } = require("child_process");

const screenPath = "src/components/game-screen.tsx";
let scr = fs.readFileSync(screenPath, "utf8");

// 1. Reaktivität einbauen: Sobald profile.equipped sich ändert, Fadenkreuz der Engine sofort anpassen
const targetEffect = `    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);`;

const newEffect = `    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (engineRef.current && profile?.equipped) {
      const color = getActiveCrosshairColor(profile.equipped);
      engineRef.current.setCrosshairColor(color);
    }
  }, [profile?.equipped]);`;

if (scr.includes(targetEffect)) {
  scr = scr.replace(targetEffect, newEffect);
  console.log("  [+] Reaktivitäts-Hook für live Farbwechsel eingefügt.");
} else {
  // Regex Fallback
  scr = scr.replace(
    /engineRef\.current\s*=\s*engine;\s*return\s*\(\)\s*=>\s*\{\s*engine\.destroy\(\);\s*engineRef\.current\s*=\s*null;\s*\};\s*\}\s*,\s*\[\]\s*\);/,
    newEffect
  );
  console.log("  [+] Reaktivitäts-Hook via Regex eingefügt.");
}

// 2. Auch beim Klick auf Spiel starten nochmals frisch die Visier-Farbe setzen
scr = scr.replace(
  /engineRef\.current\?\.start\(selectedDiff\);/g,
  `if (engineRef.current && profile?.equipped) { engineRef.current.setCrosshairColor(getActiveCrosshairColor(profile.equipped)); }\n    engineRef.current?.start(selectedDiff);`
);

fs.writeFileSync(screenPath, scr, "utf8");

console.log("Baue Projekt mit Vite neu...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Visier-Farben sind jetzt live im Spiel verbunden!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
