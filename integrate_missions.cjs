const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// Sicherheitsbackup
fs.writeFileSync(file + ".pre_missions_bak", code, "utf8");

// 1. Imports hinzufügen
if (!code.includes("MissionsModal")) {
  code = code.replace(
    'import { KioskModal, type KioskTab } from "./kiosk-modal";',
    'import { KioskModal, type KioskTab } from "./kiosk-modal";\nimport { MissionsModal } from "./missions-modal";\nimport { INITIAL_MISSIONS, type Mission } from "@/lib/missions";'
  );
  console.log("✅ 1. Imports hinzugefügt");
}

// 2. State hinzufügen
if (!code.includes("isMissionsOpen")) {
  const stateCode = `  const [isKioskOpen, setIsKioskOpen] = React.useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = React.useState(false);
  const [missions, setMissions] = React.useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem("park_missions");
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });`;

  code = code.replace(
    "const [isKioskOpen, setIsKioskOpen] = React.useState(false);",
    stateCode
  );
  console.log("✅ 2. States hinzugefügt");
}

// 3. Missions-Button unter Kiosk & Handtasche einfügen
if (!code.includes("Park-Missionen")) {
  const targetRegex = /(<span>Handtasche[\s\S]*?<\/button>\s*<\/div>)/;
  
  const missionButton = `\n          <button
            type="button"
            onClick={() => setIsMissionsOpen(true)}
            onTouchEnd={(e) => { e.stopPropagation(); setIsMissionsOpen(true); }}
            className="w-full mt-2 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Park-Missionen</span>
            </div>
            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30">
              {missions.filter(m => m.claimed).length} / {missions.length} Erledigt
            </span>
          </button>`;

  code = code.replace(targetRegex, `$1${missionButton}`);
  console.log("✅ 3. Missions-Button platziert");
}

// 4. MissionsModal direkt neben KioskModal einhängen
if (!code.includes("<MissionsModal")) {
  const kioskModalRegex = /(<KioskModal[\s\S]*?\/>)/;
  
  const modalBlock = `\n        <MissionsModal
          isOpen={isMissionsOpen}
          onClose={() => setIsMissionsOpen(false)}
          missions={missions}
          onClaim={(id) => {
            setMissions(prev => {
              const next = prev.map(m => m.id === id ? { ...m, claimed: true } : m);
              try { localStorage.setItem("park_missions", JSON.stringify(next)); } catch {}
              return next;
            });
            setProfile((p: any) => {
              const rewardItem = missions.find(m => m.id === id);
              const addCoins = rewardItem ? rewardItem.rewardCoins : 2;
              const updatedCoins = (p.coins || 0) + addCoins;
              const updated = { ...p, coins: updatedCoins };
              try {
                if (typeof saveProfile === "function") saveProfile(updated);
                syncProfileOnline(updated);
              } catch {}
              return updated;
            });
          }}
          allCompleted={missions.every(m => m.claimed || m.completed)}
          laserClaimed={false}
        />`;

  code = code.replace(kioskModalRegex, `$1${modalBlock}`);
  console.log("✅ 4. MissionsModal auf gleicher Ebene wie KioskModal platziert");
}

fs.writeFileSync(file, code, "utf8");

console.log("\nStarte Vite-Build...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Build einwandfrei durchgelaufen!");
} catch (err) {
  console.error("\n❌ Build fehlgeschlagen, spiele Backup zurück...");
  fs.copyFileSync(file + ".pre_missions_bak", file);
  process.exit(1);
}
