const fs = require("fs");
const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// Beim Einloggen: Cloud-Coins und Cloud-Missions übernehmen
const oldCoinsBlock = `coins: typeof ex.coins === "number" ? ex.coins : 0,
        inventory: Array.isArray(ex.inventory) ? ex.inventory : [],
        equipped: ex.equipped || {}`;

const newCoinsBlock = `coins: Math.max(Number(ex.coins) || 0, Number(sStats.coins) || 0),
        inventory: Array.from(new Set([...(Array.isArray(ex.inventory) ? ex.inventory : []), ...(Array.isArray(sStats.inventory) ? sStats.inventory : [])])),
        equipped: { ...(sStats.equipped || {}), ...(ex.equipped || {}) }`;

if (code.includes(oldCoinsBlock)) {
  code = code.replace(oldCoinsBlock, newCoinsBlock);
  
  // Missions aus sStats in localStorage und State laden
  const missionRestore = `
      if (Array.isArray(sStats.missions) && sStats.missions.length > 0) {
        try {
          localStorage.setItem("park_missions", JSON.stringify(sStats.missions));
          setMissions(sStats.missions);
        } catch {}
      }
`;
  code = code.replace(
    /saveProfile\(up\);\s*setProfile\(up\);/,
    `saveProfile(up);\n      setProfile(up);${missionRestore}`
  );

  fs.writeFileSync(file, code, "utf8");
  console.log("✅ Teil 2 erledigt: Login übernimmt Cloud-Groschen und Cloud-Missionen!");
} else {
  console.log("ℹ️ Teil 2: Login-Handler war bereits angepasst.");
}
