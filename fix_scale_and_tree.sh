cd ~/spiel
node -e '
const fs = require("fs");
const file = "src/game/engine.ts";
let c = fs.readFileSync(file, "utf8");

c = c.replace(/const LANES = \[\s*[\s\S]*?\s*\];/m, `const LANES = [
  { y: 880,  scale: 0.32, z: 0.15, pts: 35, speed: 45 },
  { y: 1145, scale: 0.42, z: 0.32, pts: 22, speed: 65 },
  { y: 1205, scale: 0.58, z: 0.55, pts: 14, speed: 90 },
  { y: 1265, scale: 0.72, z: 0.85, pts: 8,  speed: 118 },
];`);

c = c.replace(/const BUSHES = \[\s*[\s\S]*?\s*\];/m, `const BUSHES = [
  { x: 110, y: 1040, z: 0.28, scale: 0.45, w: 70, h: 42, facing: 1 },
  { x: 800, y: 1040, z: 0.28, scale: 0.45, w: 70, h: 42, facing: -1 }
];`);

c = c.replace(/const TREES = \[\s*[\s\S]*?\s*\];/m, `const TREES = [
  { x: 300, y: 1110, z: 0.35, trunkW: 85, scale: 0.48, facing: -1 },
  { x: 300, y: 1110, z: 0.35, trunkW: 85, scale: 0.48, facing: 1 }
];`);

c = c.replace(/if\s*\(!mauerDrawn\s*&&\s*t\.z\s*>=\s*[\d.]+\s*&&\s*mauerImg\)/, "if (!mauerDrawn && t.z >= 0.22 && mauerImg)");
c = c.replace(/if\s*\(!treeDrawn\s*&&\s*t\.z\s*>=\s*[\d.]+\s*&&\s*treeImg\)/, "if (!treeDrawn && t.z >= 0.45 && treeImg)");

if (c.includes("walkerScale")) {
  c = c.replace(/const walkerScale = L\.scale \* \(run \? 0\.72 : 1\.0\);/, "const walkerScale = L.scale;");
}

fs.writeFileSync(file, c, "utf8");
console.log("✅ Skalierung angepasst!");
'
npm run build
