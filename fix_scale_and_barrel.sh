#!/bin/bash
set -e
cd ~/spiel

node -e '
const fs = require("fs");
const file = "src/game/engine.ts";
let c = fs.readFileSync(file, "utf8");

// 1. LANES Perspektivisch korrekt skalieren (vom Torbogen bis zum Sandweg)
const newLanes = `const LANES = [
  { y: 915,  scale: 0.38, z: 0.15, pts: 35, speed: 45 },  // Mauer (schaut oben drueber)
  { y: 1115, scale: 0.40, z: 0.35, pts: 22, speed: 65 },  // Torbogen (passt durch den Bogen)
  { y: 1195, scale: 0.62, z: 0.60, pts: 14, speed: 90 },  // Rasen Mitte
  { y: 1270, scale: 0.85, z: 0.85, pts: 8,  speed: 118 }, // Sandweg vorne
];`;
c = c.replace(/const LANES = \[\s*[\s\S]*?\s*\];/m, newLanes);

// 2. Tonne (Hippie) landet auf dem Boden (y = 1240) und wird realistisch skaliert
c = c.replace(/if\s*\(t\.y\s*>=\s*1040\)\s*\{\s*t\.y\s*=\s*1040;\s*t\.vy\s*=\s*0;\s*this\.burst\(t\.x,\s*1040/g,
  "if (t.y >= 1240) {\n            t.y = 1240;\n            t.vy = 0;\n            this.burst(t.x, 1240");

c = c.replace(/act:\s*"hippie",[\s\S]*?z:\s*[\d.]+,[\s\S]*?scale:\s*[\d.]+/,
  `act: "hippie",\n      x: rand(240, WORLD_W - 240),\n      y: -120,\n      vy: 1800,\n      z: 0.75,\n      scale: 0.60`);

// 3. Basishoehen kalibrieren (Opa, Rocker, Tonne)
c = c.replace(/t\.act === "hippie" \? \d+ : t\.act === "rocker" \? \d+ : t\.act === "opa" \? \d+/,
  `t.act === "hippie" ? 230 : t.act === "rocker" ? 380 : t.act === "opa" ? 360`);

// 4. Opa & Rocker auf den Sandweg setzen (y: 1270) mit passendem Z
c = c.replace(/act:\s*"opa"[\s\S]*?y:\s*\d+,[\s\S]*?z:\s*[\d.]+,[\s\S]*?scale:\s*[\d.]+/,
  `act: "opa",\n      x: fromRight ? 960 : -80,\n      y: 1270,\n      vx: (fromRight ? -1 : 1) * speed,\n      z: 0.85,\n      facing: fromRight ? -1 : 1,\n      points: -50,\n      scale: 0.85`);

c = c.replace(/act:\s*"rocker"[\s\S]*?y:\s*\d+,[\s\S]*?z:\s*[\d.]+,[\s\S]*?scale:\s*[\d.]+/,
  `act: "rocker",\n      x: fromRight ? 960 : -80,\n      y: 1265,\n      vx: (fromRight ? -1 : 1) * speed,\n      z: 0.85,\n      facing: fromRight ? -1 : 1,\n      points: 200,\n      scale: 0.80`);

fs.writeFileSync(file, c, "utf8");
console.log("✅ Skalierung, Torbogen-Perspektive und Tonnen-Landung angepasst!");
'

npm run build
