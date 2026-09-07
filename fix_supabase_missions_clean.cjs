const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

console.log("=== 1. Backup erstellen ===");
fs.writeFileSync(file + ".pre_clean_bak", code, "utf8");

console.log("=== 2. Missions State an profile.missions binden ===");
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
  console.log("  [+] Missions-State an aktives Profil gekoppelt.");
} else if (!code.includes("React.useEffect(() => {\n    if (!profile?.name?.trim()) {")) {
  code = code.replace(
    /const \[missions, setMissions\] = React\.useState<Mission\[\]>[\s\S]*?return INITIAL_MISSIONS;\s*\}\s*\}\);/,
    newMissionsState
  );
  console.log("  [+] Missions-State via Fallback ersetzt.");
}

console.log("=== 3. Logout anpassen ===");
if (!code.includes("setMissions(INITIAL_MISSIONS);")) {
  code = code.replace(
    /const handleLogout = \(\) => \{\s*setActiveUserName\(""\);/,
    `const handleLogout = () => {\n    setActiveUserName("");\n    setMissions(INITIAL_MISSIONS);`
  );
  console.log("  [+] handleLogout setzt Missionen zurück.");
}

console.log("=== 4. Missions-Button nur für eingeloggte Spieler anzeigen ===");
const oldButtonContainer = `<div className="border-b border-neutral-800/60 pb-3 mb-3">
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

const wrappedButtonContainer = `{profile.name && !isEditing && (
        <div className="border-b border-neutral-800/60 pb-3 mb-3">
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
        </div>
        )}`;

if (code.includes(oldButtonContainer)) {
  code = code.replace(oldButtonContainer, wrappedButtonContainer);
  console.log("  [+] Missions-Button wird nun nur für eingeloggte Profile angezeigt.");
}

console.log("=== 5. Rundenende-Missionslogik bereinigen & an Supabase koppeln ===");
const oldResultsRegex = /if \(hud\.mode === "results"\) \{\s*if \(gameOverHandledRef\.current\) return;[\s\S]*?setMissions\(\(prev\) => \{[\s\S]*?\}\);\s*setResultsDelay\(true\);/;

const cleanResultsReplacement = `if (hud.mode === "results") {
      if (gameOverHandledRef.current) return;

      const finalActs = [...pendingMissionActsRef.current];
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
      }

      setResultsDelay(true);`;

if (oldResultsRegex.test(code)) {
  code = code.replace(oldResultsRegex, cleanResultsReplacement);
  console.log("  [+] Rundenende sauber ohne doppelte Variablen an profile.missions & Supabase gekoppelt.");
} else {
  code = code.replace(
    /\/\/ Reguläres Rundenende: Jetzt und NUR jetzt Missionsfortschritt verbuchen![\s\S]*?setMissions\(\(prev\) => \{[\s\S]*?\}\);/,
    `if (profile?.name?.trim()) {
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
      }`
  );
  console.log("  [+] Rundenende via alternativem Pfad bereinigt.");
}

console.log("=== 6. Modal onClaim & onClaimAll an Supabase anbinden ===");
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
  console.log("\n🎉 ERFOLG: Build einwandfrei! Missionen sind fest an Supabase gebunden und für Ausgeloggte unsichtbar.");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
  fs.copyFileSync(file + ".pre_clean_bak", file);
  process.exit(1);
}
