#!/bin/bash
set -e
cd ~/spiel

node -e '
const fs = require("fs");
const file = "src/game/engine.ts";
let c = fs.readFileSync(file, "utf8");

if (!c.includes("\"new-bg-standard\"")) {
  c = c.replace(/(["\x27]park-bg["\x27]\s*:\s*["\x27][^"\x27]+["\x27],?)/, `$1\n  "new-bg-standard": "/new-bg-standard.png",\n  "parkmauer": "/parkmauer.png",\n  "new-tree": "/new-tree.png",`);
}

const bgDrawRegex = /const bg = this\.img\([^)]+\);[\s\S]*?ctx\.drawImage\(bg,[^;]+;/m;
if (bgDrawRegex.test(c)) {
  c = c.replace(bgDrawRegex, `const bg = this.img("new-bg-standard") || this.img("park-bg");
    if (bg) {
      ctx.drawImage(bg, 0, 0, WORLD_W, WORLD_H);
    }`);
}

const renderLoopRegex = /let treeDrawn = false;[\s\S]*?this\.drawTarget\(t\);\s*\}\s*if\s*\(!treeDrawn\)[\s\S]*?WORLD_H\);\s*\}/m;
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

if (renderLoopRegex.test(c)) {
  c = c.replace(renderLoopRegex, newRenderLoop);
}

fs.writeFileSync(file, c, "utf8");
console.log("✅ 9:16 Grafiken direkt ohne Crop eingebunden!");
'

npm run build
