const fs = require("fs");
const { execSync } = require("child_process");

const screenPath = "src/components/game-screen.tsx";
let scr = fs.readFileSync(screenPath, "utf8");

const oldPart = `<div className="h-2.5 w-full overflow-hidden rounded-full bg-ink border border-line">
                         <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full" style={{ width: \`\${prog.percent}%\` }} />
                         <MissionsModal`;

const newPart = `<div className="h-2.5 w-full overflow-hidden rounded-full bg-ink border border-line">
                         <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full" style={{ width: \`\${prog.percent}%\` }} />
                       </div>

                       <MissionsModal`;

if (scr.includes(oldPart)) {
  scr = scr.replace(oldPart, newPart);
  fs.writeFileSync(screenPath, scr, "utf8");
  console.log("✅ MissionsModal erfolgreich aus dem Fortschrittsbalken herausgelöst und korrekt platziert!");
} else {
  console.log("⚠️ Versuche alternatives Ersetzen...");
  scr = scr.replace(
    /<div className="h-2\.5 w-full overflow-hidden rounded-full bg-ink border border-line">[\s\S]*?<MissionsModal/,
    `<div className="h-2.5 w-full overflow-hidden rounded-full bg-ink border border-line">
                         <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full" style={{ width: \`\${prog.percent}%\` }} />
                       </div>

                       <MissionsModal`
  );
  fs.writeFileSync(screenPath, scr, "utf8");
}

console.log("Baue Projekt mit Vite neu...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Das Missions-Fenster poppt jetzt beim Klick perfekt auf!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
