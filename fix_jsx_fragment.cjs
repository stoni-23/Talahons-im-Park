const fs = require("fs");
const { execSync } = require("child_process");

const screenPath = "src/components/game-screen.tsx";
let scr = fs.readFileSync(screenPath, "utf8");

// Wir ersetzen den betroffenen Bereich so, dass die angrenzenden Elemente in ein Fragment <> ... </> oder ein div eingefasst sind
const targetSnippet = `                       </div>

                       <MissionsModal`;

// Suchen wir nach dem fehlerhaften Block und setzen ein sauberes Fragment drumherum
scr = scr.replace(
  /<div className="h-2\.5 w-full overflow-hidden rounded-full bg-ink border border-line">[\s\S]*?<\/MissionsModal>\s*<\/div>/,
  `<div className="h-2.5 w-full overflow-hidden rounded-full bg-ink border border-line">
                         <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full" style={{ width: \`\${prog.percent}%\` }} />
                       </div>
                       
                       <MissionsModal
                         isOpen={isMissionsOpen}
                         onClose={() => setIsMissionsOpen(false)}
                         missions={missions}
                         onClaim={(id) => {
                           setMissions(prev => {
                             const next = prev.map(m => m.id === id ? { ...m, claimed: true } : m);
                             localStorage.setItem("park_missions", JSON.stringify(next));
                             return next;
                           });
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
                       />`
);

fs.writeFileSync(screenPath, scr, "utf8");
console.log("✅ JSX-Struktur korrigiert. Baue Projekt neu...");

try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 BUILD ERFOLGREICH! Das Missions-Modal ist jetzt perfekt eingebunden!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
