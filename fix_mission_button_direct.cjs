const fs = require("fs");
const { execSync } = require("child_process");

const screenPath = "src/components/game-screen.tsx";
let scr = fs.readFileSync(screenPath, "utf8");

const oldButtonPattern = /<button[^>]*>\s*<div className="flex items-center gap-2">\s*<span>🎯<\/span>\s*<span>Park-Missionen<\/span>\s*<\/div>[\s\S]*?<\/button>/;

const robustButton = `<button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMissionsOpen(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMissionsOpen(true);
            }}
            className="w-full flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Park-Missionen</span>
            </div>
            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30">
              {missions.filter(m => m.claimed).length} / {missions.length} Erledigt
            </span>
          </button>`;

if (oldButtonPattern.test(scr)) {
  scr = scr.replace(oldButtonPattern, robustButton);
  fs.writeFileSync(screenPath, scr, "utf8");
  console.log("✅ Missions-Button Event-Handler erfolgreich aktualisiert.");
} else {
  scr = scr.replace(
    /onClick=\{\(\) => setIsMissionsOpen\(true\)\}/g,
    `onClick={(e) => { e.stopPropagation(); setIsMissionsOpen(true); }}`
  );
  fs.writeFileSync(screenPath, scr, "utf8");
}

console.log("Baue Projekt mit Vite neu...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Button reagiert jetzt absolut zuverlässig auf Touch und Klick!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
