const fs = require("fs");

console.log("=== Zeilen 1445 bis 1490 in src/game/engine.ts ===");
const lines = fs.readFileSync("src/game/engine.ts", "utf8").split("\n");
lines.slice(1444, 1495).forEach((line, idx) => {
  console.log(`${1445 + idx}: ${line}`);
});

console.log("\n=== Suche nach profile.equipped oder setCrosshairColor in engine.ts ===");
lines.forEach((l, idx) => {
  if (l.includes("crosshair") || l.includes("equipped")) {
    console.log(`${idx + 1}: ${l}`);
  }
});
