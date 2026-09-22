#!/bin/bash
set -e
cd ~/spiel

node -e '
const fs = require("fs");
const file = "src/game/engine.ts";
let c = fs.readFileSync(file, "utf8");

// 1. Assets registrieren
if (!c.includes("\"new-bg-standard\"")) {
  c = c.replace(
    /const ASSET_KEYS = \[\s*[\r\n]+/,
    `const ASSET_KEYS = [\n  "new-bg-standard",\n  "parkmauer",\n  "new-tree",\n`
  );
}

// 2. 9:16 Hintergrund 1:1 zeichnen (ohne Crop)
const bgDrawRegex = /const bg = this\.img\("park-bg"\);[\s\S]*?ctx\.drawImage\(bg,[^;]+;\s*\}/m;
if (bgDrawRegex.test(c)) {
  c = c.replace(
    bgDrawRegex,
    `const bg = this.img("new-bg-standard") || this.img("park-bg");
    if (bg) {
      ctx.drawImage(bg, 0, 0, WORLD_W, WORLD_H);
    }`
  );
}

// 3. Render-Loop: Alpha-Reset & Overlays (Mauer z>=0.22, Baum z>=0.48)
const renderLoopRegex = /let treeDrawn = false;[\s\S]*?for \(const t of sorted\) \{[\s\S]*?if \(!treeDrawn\) \{[\s\S]*?WORLD_H\);\s*\}\s*\}/m;
const newRenderLoop = `ctx.globalAlpha = 1.0;
    let mauerDrawn = false;
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

if (renderLoopRegex.test(c)) {
  c = c.replace(renderLoopRegex, newRenderLoop);
}

// 4. LANES neu staffeln
const lanesRegex = /const LANES = \[\s*[\s\S]*?\s*\];/m;
const newLanes = `const LANES = [
  { y: 890,  scale: 0.48, z: 0.15, pts: 35, speed: 45 },  // Auf/Hinter der Mauer
  { y: 1120, scale: 0.68, z: 0.35, pts: 22, speed: 65 },  // Torbogen (hinter new-tree)
  { y: 1200, scale: 0.88, z: 0.65, pts: 14, speed: 90 },  // Rasen Mitte (vor new-tree)
  { y: 1275, scale: 1.08, z: 0.88, pts: 8,  speed: 118 }, // Sandweg vorne
];`;
if (lanesRegex.test(c)) {
  c = c.replace(lanesRegex, newLanes);
}

// 5. Peeker und Buesche anpassen
c = c.replace(/const BUSHES = \[\s*[\s\S]*?\s*\];/m, `const BUSHES = [
  { x: 95, y: 1040, z: 0.28, scale: 0.50, w: 60, h: 38, facing: 1 },
  { x: 815, y: 1040, z: 0.28, scale: 0.50, w: 60, h: 38, facing: -1 }
];`);

c = c.replace(/const TREES = \[\s*[\s\S]*?\s*\];/m, `const TREES = [
  { x: 280, y: 1110, z: 0.40, trunkW: 65, scale: 0.55, facing: -1 },
  { x: 280, y: 1110, z: 0.40, trunkW: 65, scale: 0.55, facing: 1 }
];`);

// 6. Rocker und Opa etwas kleiner skalieren
c = c.replace(/t\.act === "rocker" \? 430 : t\.act === "opa" \? 380/, `t.act === "rocker" ? 370 : t.act === "opa" ? 330`);

fs.writeFileSync(file, c, "utf8");
console.log("Fertig angepasst!");
'

npm run build
