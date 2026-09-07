const fs = require("fs");
const { execSync } = require("child_process");

const screenPath = "src/components/game-screen.tsx";
let scr = fs.readFileSync(screenPath, "utf8");

// 1. Eventuelle Duplikate oder fehlerhafte States entfernen
scr = scr.replace(/const \[isMissionsOpen, setIsMissionsOpen\] = useState\(false\);/g, "");
scr = scr.replace(/const \[missions, setMissions\] = useState\([^)]+\);\s*/g, "");

// 2. States direkt am Anfang der GameScreen-Funktion sauber platzieren
const targetHeader = "export function GameScreen(";
const stateInsert = `export function GameScreen({ onGameOver, initialProfile }: { onGameOver: (score: number, stats: any) => void; initialProfile?: any }) {
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem("park_missions");
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });`;

if (scr.includes(targetHeader)) {
  scr = scr.replace(/export function GameScreen\([^)]*\)\s*\{/, stateInsert);
}

fs.writeFileSync(screenPath, scr, "utf8");

console.log("Baue Projekt mit Vite neu...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Scope-Fehler behoben, Vite-Build erfolgreich!");
} catch (err) {
  console.error("Fehler beim Build!");
  process.exit(1);
}
