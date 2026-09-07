const fs = require("fs");

const scr = fs.readFileSync("src/components/game-screen.tsx", "utf8");
const lines = scr.split("\n");

console.log("=== Vorkommen in src/components/game-screen.tsx ===");
lines.forEach((l, i) => {
  if (
    l.includes("new GameEngine") ||
    l.includes("engineRef") ||
    l.includes("setCrosshairColor") ||
    l.includes("getActiveCrosshairColor") ||
    l.includes("engine.start") ||
    l.includes("const engine =")
  ) {
    console.log(`Z.${i + 1}: ${l.trim()}`);
  }
});
