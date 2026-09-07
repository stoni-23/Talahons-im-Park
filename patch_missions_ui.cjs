const fs = require("fs");
const { execSync } = require("child_process");

const screenPath = "src/components/game-screen.tsx";
let scr = fs.readFileSync(screenPath, "utf8");

// 1. Import für MissionsModal & INITIAL_MISSIONS einfügen
if (!scr.includes("MissionsModal")) {
  scr = `import { MissionsModal } from "./missions-modal";\nimport { INITIAL_MISSIONS, Mission } from "@/lib/missions";\n` + scr;
}

// 2. States für Missionen im Component einfügen (falls nicht vorhanden)
if (!scr.includes("missions:")) {
  scr = scr.replace(
    /const \[isKioskOpen, setIsKioskOpen\] = useState\(false\);/,
    `const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem("park_missions");
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });`
  );
}

// 3. Den Platzhalter "Hier starten in Kürze..." durch den echten Missions-Button / Fortschritt ersetzen
const oldPlaceholder = `<div className="min-h-[70px] flex items-center justify-center border-b border-neutral-800/60 pb-3 mb-3 text-xs text-neutral-500 italic">
          Hier starten in Kürze deine Park-Missionen...
        </div>`;

const newMissionButton = `<div className="border-b border-neutral-800/60 pb-3 mb-3">
          <button
            type="button"
            onClick={() => setIsMissionsOpen(true)}
            onTouchEnd={(e) => { e.stopPropagation(); setIsMissionsOpen(true); }}
            className="w-full flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Park-Missionen</span>
            </div>
            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30">
              {missions.filter(m => m.claimed).length} / {missions.length} Erledigt
            </span>
          </button>
        </div>`;

if (scr.includes(oldPlaceholder)) {
  scr = scr.replace(oldPlaceholder, newMissionButton);
}

// 4. MissionsModal am Ende vor dem letzten Schließen-Tag einfügen
if (!scr.includes("<MissionsModal")) {
  // Wir suchen vor dem letzten div oder am Ende des Return-Blocks
  const targetTag = /<\/div>\s*<\/div>\s*;\s*\}/;
  // Fallback: vor dem letzten div im Haupt-JSX
  scr = scr.replace(
    /(<\/[a-zA-Z]+\s*>\s*<\/div>\s*\);\s*\})/,
    `  <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        missions={missions}
        onClaim={(id) => {
          setMissions(prev => {
            const next = prev.map(m => m.id === id ? { ...m, claimed: true } : m);
            localStorage.setItem("park_missions", JSON.stringify(next));
            return next;
          });
          // Groschen gutschreiben +2 oder +3 oder +4...
          setProfile(p => {
            const rewardItem = missions.find(m => m.id === id);
            const addCoins = rewardItem ? rewardItem.rewardCoins : 2;
            const updatedCoins = (p.coins || 0) + addCoins;
            const updated = { ...p, coins: updatedCoins };
            localStorage.setItem("park_profile", JSON.stringify(updated));
            return updated;
          });
        }}
        allCompleted={missions.every(m => m.claimed || m.completed)}
        laserClaimed={false}
      />\n$1`
  );
}

fs.writeFileSync(screenPath, scr, "utf8");

console.log("Baue Projekt mit Vite neu...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Missions-Button und Modal erfolgreich integriert!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
