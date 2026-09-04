const fs = require("fs");
let code = fs.readFileSync("src/game/engine.ts", "utf8");

// Standard-Namen entfernen
code = code.replace(/this\.profile\.name\s*=\s*entered\s*\|\|\s*["\x27][^"\x27]*["\x27]/g, "this.profile.name = entered || \"\"");

// Opa-Spawn-Sound fixen
code = code.replace(/playOpaSpawn\(\);?\s*/g, "");
code = code.replace(/if\s*\([^)]*act\s*===\s*["']opa["'][^)]*\)\s*return;/, "$&\n    playOpaSpawn();");

fs.writeFileSync("src/game/engine.ts", code, "utf8");
console.log("engine.ts aktualisiert!");
