cd ~/spiel
node -e '
const fs = require("fs");
const file = "src/game/engine.ts";
let c = fs.readFileSync(file, "utf8");

c = c.replace(/this\.img\("park-bg"\)/g, "this.img(\"new-bg-standard\") || this.img(\"park-bg\")");

const renderLoopRegex = /let treeDrawn = false;[\s\S]*?this\.drawTarget\(t\);\s*\}/m;
const newRenderLoop = `let mauerDrawn = false;
    let treeDrawn = false;
    const mauerImg = this.img("parkmauer");
    const treeImg = this.img("new-tree") || this.img("tree");

    for (const t of sorted) {
      if (!mauerDrawn && t.z >= 0.22 && mauerImg) {
        ctx.drawImage(mauerImg, 0, 0, WORLD_W, WORLD_H);
        mauerDrawn = true;
      }
      if (!treeDrawn && t.z >= 0.48 && treeImg) {
        ctx.drawImage(treeImg, 0, 0, WORLD_W, WORLD_H);
        treeDrawn = true;
      }
      this.drawTarget(t);
    }
    if (!mauerDrawn && mauerImg) ctx.drawImage(mauerImg, 0, 0, WORLD_W, WORLD_H);
    if (!treeDrawn && treeImg) ctx.drawImage(treeImg, 0, 0, WORLD_W, WORLD_H);`;

c = c.replace(renderLoopRegex, newRenderLoop);

c = c.replace(/const LANES = \[\s*[\s\S]*?\s*\];/m, `const LANES = [
  { y: 880,  scale: 0.45, z: 0.15, pts: 35, speed: 45 },
  { y: 1145, scale: 0.56, z: 0.35, pts: 22, speed: 65 },
  { y: 1205, scale: 0.75, z: 0.55, pts: 14, speed: 90 },
  { y: 1270, scale: 0.88, z: 0.85, pts: 8,  speed: 118 },
];`);

c = c.replace(/const BUSHES = \[\s*[\s\S]*?\s*\];/m, `const BUSHES = [
  { x: 110, y: 1040, z: 0.28, scale: 0.55, w: 70, h: 42, facing: 1 },
  { x: 800, y: 1040, z: 0.28, scale: 0.55, w: 70, h: 42, facing: -1 }
];`);

c = c.replace(/const TREES = \[\s*[\s\S]*?\s*\];/m, `const TREES = [
  { x: 300, y: 1110, z: 0.40, trunkW: 85, scale: 0.60, facing: -1 },
  { x: 300, y: 1110, z: 0.40, trunkW: 85, scale: 0.60, facing: 1 }
];`);

c = c.replace(/const walkerScale = L\.scale \* \(run \? [\d.]+ : 1\.0?\);/, "const walkerScale = L.scale;");

fs.writeFileSync(file, c, "utf8");
console.log("✅ Neuer Hintergrund, Overlays und Z-Ebenen erfolgreich eingerichtet!");
'
npm run build
