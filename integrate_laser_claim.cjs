const fs = require("fs");
const { execSync } = require("child_process");

console.log("=== 1. src/components/missions-modal.tsx anpassen ===");
const modalPath = "src/components/missions-modal.tsx";
let modalCode = fs.readFileSync(modalPath, "utf8");

// Props-Interface erweitern um onClaimLaser
if (!modalCode.includes("onClaimLaser")) {
  modalCode = modalCode.replace(
    /interface MissionsModalProps\s*\{/,
    `interface MissionsModalProps {\n  onClaimLaser?: () => void;`
  );
  modalCode = modalCode.replace(
    /laserClaimed,(\s*\}\:\s*MissionsModalProps)/,
    `laserClaimed,\n  onClaimLaser,$1`
  );
}

// Hauptpreis-Feld mit interaktivem Abhol-Button ausstatten
const targetPrizeRegex = /<div className="mt-3 rounded-xl border border-emerald-500\/30 bg-emerald-950\/20 p-2\.5 text-center">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;

const interactivePrizeSection = `<div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base">🏆</span>
              <h3 className="font-bold text-xs text-emerald-400">Hauptpreis: Giftgrün-Laser Visier</h3>
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Schließe alle 5 Park-Missionen ab, um den Laser einzustecken!
            </p>
            <div className="mt-2.5">
              {laserClaimed ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <span>✓</span>
                  <span>Giftgrün-Laser in der Handtasche & aktiv!</span>
                </div>
              ) : allCompleted ? (
                <button
                  type="button"
                  onClick={() => onClaimLaser && onClaimLaser()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 py-2.5 px-4 text-xs font-extrabold text-black shadow-lg shadow-emerald-950/50 animate-bounce active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">🟢</span>
                  <span>JETZT ABHOLEN: Giftgrün-Laser freischalten!</span>
                </button>
              ) : (
                <span className="inline-block rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-500">
                  🔒 Noch gesperrt ({missions.filter(m => m.completed || m.claimed).length}/5 erledigt)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

if (targetPrizeRegex.test(modalCode)) {
  modalCode = modalCode.replace(targetPrizeRegex, interactivePrizeSection);
  fs.writeFileSync(modalPath, modalCode, "utf8");
  console.log("  [+] missions-modal.tsx mit Abhol-Button aktualisiert.");
} else {
  modalCode = modalCode.replace(
    /\{allCompleted \? \([\s\S]*?\) : \([\s\S]*?\)\}/,
    `laserClaimed ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <span>✓</span>
                  <span>Giftgrün-Laser in der Handtasche & aktiv!</span>
                </div>
              ) : allCompleted ? (
                <button
                  type="button"
                  onClick={() => onClaimLaser && onClaimLaser()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 py-2.5 px-4 text-xs font-extrabold text-black shadow-lg shadow-emerald-950/50 animate-bounce active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">🟢</span>
                  <span>JETZT ABHOLEN: Giftgrün-Laser freischalten!</span>
                </button>
              ) : (
                <span className="inline-block rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-500">
                  🔒 Noch gesperrt ({missions.filter(m => m.completed || m.claimed).length}/5 erledigt)
                </span>
              )`
  );
  fs.writeFileSync(modalPath, modalCode, "utf8");
  console.log("  [+] missions-modal.tsx Preis-Bereich via Fallback aktualisiert.");
}

console.log("\n=== 2. src/components/game-screen.tsx anpassen ===");
const screenPath = "src/components/game-screen.tsx";
let screenCode = fs.readFileSync(screenPath, "utf8");

screenCode = screenCode.replace(
  /laserClaimed=\{false\}/g,
  `laserClaimed={Array.isArray(profile.inventory) && profile.inventory.includes("visier_neon")}`
);

if (!screenCode.includes("onClaimLaser=")) {
  screenCode = screenCode.replace(
    /<MissionsModal/,
    `<MissionsModal\n          onClaimLaser={() => {\n            setProfile((prev: any) => {\n              const inv = Array.isArray(prev.inventory) ? prev.inventory : [];\n              if (inv.includes("visier_neon")) return prev;\n              const updatedInv = [...inv, "visier_neon"];\n              const updatedEquipped = { ...(prev.equipped || {}), visier: "visier_neon" };\n              const updated = { ...prev, inventory: updatedInv, equipped: updatedEquipped };\n              try {\n                localStorage.setItem("park_profile", JSON.stringify(updated));\n                if (typeof saveProfile === "function") saveProfile(updated);\n                if (typeof syncProfileOnline === "function") syncProfileOnline(updated);\n              } catch {}\n              return updated;\n            });\n          }}`
  );
  fs.writeFileSync(screenPath, screenCode, "utf8");
  console.log("  [+] onClaimLaser Klick-Verbindung in game-screen.tsx hergestellt.");
} else {
  console.log("  [+] onClaimLaser war bereits in game-screen.tsx registriert.");
}

console.log("\n=== 3. Vite-Build ausführen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Der Abhol-Button ist jetzt scharf geschaltet und bereit!");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
  process.exit(1);
}
