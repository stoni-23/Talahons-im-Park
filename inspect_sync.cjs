const fs = require("fs");

console.log("=== 1. profile.ts ===");
if (fs.existsSync("src/lib/profile.ts")) {
  const pLines = fs.readFileSync("src/lib/profile.ts", "utf8").split("\n");
  pLines.slice(0, 40).forEach((l, i) => console.log(`${i+1}: ${l}`));
}

console.log("\n=== 2. scores.ts - equipped & sync ===");
if (fs.existsSync("src/game/scores.ts")) {
  const sLines = fs.readFileSync("src/game/scores.ts", "utf8").split("\n");
  sLines.forEach((l, i) => {
    if (l.includes("syncProfileOnline") || l.includes("equipped") || l.includes("persistAccountStats") || l.includes("fetchAccountStats")) {
      console.log(`Z.${i+1}: ${l.trim()}`);
    }
  });
}
