const fs = require("fs");
let c = fs.readFileSync("src/game/engine.ts", "utf8");
c = c.replace(/playOpaSpawn\(\);?\s*/g, "");
c = c.replace(/if\s*\([^)]*act\s*===\s*["']opa["'][^)]*\)\s*return;/, "$&\n    playOpaSpawn();");
fs.writeFileSync("src/game/engine.ts", c, "utf8");
console.log("Opa-Sound sauber korrigiert!");
