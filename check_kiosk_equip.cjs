const fs = require("fs");

const scr = fs.readFileSync("src/components/game-screen.tsx", "utf8");
const lines = scr.split("\n");

console.log("=== 1. Zeilen 205 bis 235 in game-screen.tsx ===");
lines.slice(205, 235).forEach((l, i) => {
  console.log(`Z.${206 + i}: ${l}`);
});

console.log("\n=== 2. KioskModal Einbindung in game-screen.tsx ===");
lines.forEach((l, i) => {
  if (l.includes("<KioskModal") || l.includes("onProfileUpdate") || l.includes("profile=")) {
    console.log(`Z.${i + 1}: ${l.trim()}`);
  }
});
