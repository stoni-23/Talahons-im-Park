const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

console.log("=== 1. Backup erstellen ===");
fs.writeFileSync(file + ".pre_supabase_missions_bak", code, "utf8");

console.log("=== 2. Missions State an profile.missions binden ===");
// Initialer State: Nicht mehr aus globalem localStorage, sondern aus INITIAL_MISSIONS bzw. synchron zum aktiven Profil
const oldMissionsStateRegex = /const \[missions, setMissions\] = React\.useState<Mission\[\]>\(\(\) => \{[\s\S]*?return INITIAL_MISSIONS;\s*\}\s*\}\);/;

const newMissionsState = `const [missions, setMissions] = React.useState<Mission[]>(INITIAL_MISSIONS);

  // Synchronisiere Missionen immer mit dem eingeloggten Profil
  React.useEffect(() => {
    if (!profile?.name?.trim()) {
      setMissions(INITIAL_MISSIONS);
      return;
    }
    if (Array.isArray(profile.missions) && profile.missions.length > 0) {
      setMissions(profile.missions);
    } else {
      setMissions(INITIAL_MISSIONS);
    }
  }, [profile?.name, profile?.missions]);`;

if (oldMissionsStateRegex.test(code)) {
  code = code.replace(oldMissionsStateRegex, newMissionsState);
  console.log("  [+] Missions-State reagiert nun reaktiv auf das aktive Profil.");
} else {
  code = code.replace(
    /const \[missions, setMissions\] = React\.useState<Mission\[\]>[\s\S]*?return INITIAL_MISSIONS;\s*\}\s*\}\);/,
    newMissionsState
  );
  console.log("  [+] Missions-State via Fallback ersetzt.");
}

console.log("=== 3. Logout anpassen: Missionen sofort zurücksetzen ===");
if (!code.includes("setMissions(INITIAL_MISSIONS);")) {
  code = code.replace(
    /const handleLogout = \(\) => \{\s*setActiveUserName\(""\);/,
    `const handleLogout = () => {\n    setActiveUserName("");\n    setMissions(INITIAL_MISSIONS);`
  );
  console.log("  [+] handleLogout setzt Missionen zurück.");
}

console.log("=== 4. Missions-Button nur für eingeloggte Spieler anzeigen ===");
// Missions-Button bedingt rendern: {Boolean(profile?.name?.trim()) && (<button ...>Park-Missionen</button>)}
const missionButtonRegex = /(<button[^>]*>[\s\S]*?<span[^>]*>Park-Missionen<\/span>[\s\S]*?<\/button>)/;

if (missionButtonRegex.test(code)) {
  code = code.replace(
    missionButtonRegex,
    `{Boolean(profile?.name?.trim()) && (\n        $1\n        )}`
  );
  console.log("  [+] Missions-Button wird für Gäste/Ausgeloggte ab sofort komplett ausgeblendet.");
} else {
  console.log("  [!] Missions-Button Pattern für Ein-/Ausblenden nicht direkt gematcht.");
}

console.log("=== 5. Missions-Fortschritt direkt in profile.missions speichern & synchronisieren ===");
// In hud.mode === 'results' wird der Fortschritt direkt in das Spielerprofil übertragen und via syncProfileOnline gespeichert
const oldResultsMissionsPattern = /setMissions\(\(prev\) => \{\s*let currentMissions = prev;[\s\S]*?return currentMissions;\s*\}\);/;

const newResultsMissionsCode = `const finalActs = [...pendingMissionActsRef.current];
      pendingMissionActsRef.current = [];

      if (profile?.name?.trim()) {
        let currentMissions = Array.isArray(profile.missions) && profile.missions.length > 0 ? profile.missions : missions;
        const r1 = updateMissionProgress(currentMissions, { type: "round_completed" });
        currentMissions = r1.updated;
        const r2 = updateMissionProgress(currentMissions, { type: "score", points: hud.score || 0 });
        currentMissions = r2.updated;
        for (const act of finalActs) {
          const rHit = updateMissionProgress(currentMissions, { type: "hit", act });
          currentMissions = rHit.updated;
        }

        setMissions(currentMissions);
        setProfile((prev: any) => {
          const updated = { ...prev, missions: currentMissions };
          try {
            localStorage.setItem("park_profile", JSON.stringify(updated));
            if (typeof saveProfile === "function") saveProfile(updated);
            if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
          } catch {}
          return updated;
        });
      }`;

if (oldResultsMissionsPattern.test(code)) {
  code = code.replace(oldResultsMissionsPattern, newResultsMissionsCode);
  console.log("  [+] Rundenabschluss synchronisiert Missionen fest mit Supabase.");
}

console.log("=== 6. Modal onClaim & onClaimAll an profile.missions & Supabase anbinden ===");
// Modal onClaim
code = code.replace(
  /onClaim=\{\(id\) => \{\s*setMissions\(prev => \{[\s\S]*?return updated;\s*\}\);\s*\}\}/,
  `onClaim={(id) => {
            const next = missions.map(m => m.id === id ? { ...m, claimed: true } : m);
            setMissions(next);
            setProfile((p: any) => {
              const rewardItem = missions.find(m => m.id === id);
              const addCoins = rewardItem ? rewardItem.rewardCoins : 2;
              const updatedCoins = (p.coins || 0) + addCoins;
              const updated = { ...p, coins: updatedCoins, missions: next };
              try {
                localStorage.setItem("park_profile", JSON.stringify(updated));
                if (typeof saveProfile === "function") saveProfile(updated);
                if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
              } catch {}
              return updated;
            });
          }}`
);

// Modal onClaimAll
code = code.replace(
  /onClaimAll=\{\(\) => \{\s*const claimables = missions\.filter\(m => m\.completed && !m\.claimed\);[\s\S]*?return updated;\s*\}\);\s*\}\}/,
  `onClaimAll={() => {
            const claimables = missions.filter(m => m.completed && !m.claimed);
            if (claimables.length === 0) return;
            const totalAdd = claimables.reduce((acc, m) => acc + m.rewardCoins, 0);
            const next = missions.map(m => m.completed ? { ...m, claimed: true } : m);
            setMissions(next);
            setProfile((p: any) => {
              const updatedCoins = (p.coins || 0) + totalAdd;
              const updated = { ...p, coins: updatedCoins, missions: next };
              try {
                localStorage.setItem("park_profile", JSON.stringify(updated));
                if (typeof saveProfile === "function") saveProfile(updated);
                if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
              } catch {}
              return updated;
            });
          }}`
);

fs.writeFileSync(file, code, "utf8");

console.log("\n=== 7. Vite Build ausführen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Missionen sind jetzt fest an den Supabase-Account gekoppelt und für Ausgeloggte unsichtbar!");
} catch (err) {
  console.error("Fehler beim Build. Stelle Backup wieder her...", err.message);
  fs.copyFileSync(file + ".pre_supabase_missions_bak", file);
  process.exit(1);
}
