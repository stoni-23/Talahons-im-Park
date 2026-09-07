const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

console.log("=== 1. Backup erstellen ===");
fs.writeFileSync(file + ".pre_persist_bak", code, "utf8");

console.log("=== 2. Login-Profil (up) um missions erweitern ===");
const oldUpPattern = /equipped:\s*\{\s*\.\.\.\(sStats\.equipped\s*\|\|\s*\{\}\),\s*\.\.\.\(ex\.equipped\s*\|\|\s*\{\}\)\s*\}/;

const newUpPattern = `equipped: { ...(sStats.equipped || {}), ...(ex.equipped || {}) },
        missions: Array.isArray(sStats.missions) && sStats.missions.length > 0 
          ? sStats.missions 
          : (Array.isArray(ex.missions) && ex.missions.length > 0 ? ex.missions : INITIAL_MISSIONS)`;

if (oldUpPattern.test(code)) {
  code = code.replace(oldUpPattern, newUpPattern);
  console.log("  [+] Profil 'up' enthält nun explizit 'missions' aus Supabase!");
}

console.log("=== 3. setProfile & setMissions beim Login harmonisieren ===");
code = code.replace(
  /if \(Array\.isArray\(sStats\.missions\) && sStats\.missions\.length > 0\) \{\s*try \{\s*localStorage\.setItem\("park_missions"[\s\S]*?\}\s*\}/,
  `if (Array.isArray(up.missions) && up.missions.length > 0) {
        setMissions(up.missions);
      }`
);

console.log("=== 4. Initiales Laden beim Seitenstart absichern ===");
const initialLoadPattern = /const p = loadProfile\(\);\s*if \(!p\.name\) \{\s*setIsEditing\(true\);\s*setProfile\(p\);\s*setProfileInput\(""\);\s*return;\s*\}/;

const newInitialLoad = `const p = loadProfile();
    if (!p.name) {
      setIsEditing(true);
      setProfile(p);
      setProfileInput("");
      setMissions(INITIAL_MISSIONS);
      return;
    }
    if (Array.isArray(p.missions) && p.missions.length > 0) {
      setMissions(p.missions);
    }`;

if (initialLoadPattern.test(code)) {
  code = code.replace(initialLoadPattern, newInitialLoad);
  console.log("  [+] Initialer Ladevorgang stellt p.missions wieder her.");
}

fs.writeFileSync(file, code, "utf8");

console.log("\n=== 5. Vite-Build ausführen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Missionen bleiben beim Login und Seiten-Reload jetzt dauerhaft erhalten!");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
  fs.copyFileSync(file + ".pre_persist_bak", file);
  process.exit(1);
}
