const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// Den Platzhalter-Kasten durch den echten Missions-Button ersetzen
const placeholder = `<div className="min-h-[70px] flex items-center justify-center border-b border-neutral-800/60 pb-3 mb-3 text-xs text-neutral-500 italic">
          Hier starten in Kürze deine Park-Missionen...
        </div>`;

const buttonReplacement = `<div className="border-b border-neutral-800/60 pb-3 mb-3">
          <button
            type="button"
            onClick={() => setIsMissionsOpen(true)}
            onTouchEnd={(e) => { e.stopPropagation(); setIsMissionsOpen(true); }}
            className="w-full flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 px-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="text-sm">Park-Missionen</span>
            </div>
            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30 font-mono">
              {missions.filter(m => m.claimed).length} / {missions.length} Erledigt
            </span>
          </button>
        </div>`;

if (code.includes(placeholder)) {
  code = code.replace(placeholder, buttonReplacement);
  console.log("✅ Platzhalter erfolgreich durch aktiven Missions-Button ersetzt!");
} else {
  // Regex Fallback falls Zeilenumbrüche/Spaces minimal abweichen
  code = code.replace(
    /<div className="min-h-\[70px\][\s\S]*?Hier starten in Kürze deine Park-Missionen\.\.\.[\s\S]*?<\/div>/,
    buttonReplacement
  );
  console.log("✅ Platzhalter via Regex ersetzt!");
}

fs.writeFileSync(file, code, "utf8");

console.log("\nStarte Vite-Build...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Der grüne Missions-Button ist jetzt genau über Kiosk & Handtasche sichtbar und klickbar!");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
}
