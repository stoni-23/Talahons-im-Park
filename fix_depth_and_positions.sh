#!/bin/bash
set -e
cd ~/spiel

node -e '
const fs = require("fs");
const file = "src/game/engine.ts";
let c = fs.readFileSync(file, "utf8");

// ============================================================================
// 1. Tonne (Hippie) landet auf dem Boden (1220 statt 1040) & z-Koordinate anpassen
// ============================================================================
c = c.replace(/t\.y\s*>=\s*1040\s*\{\s*t\.y\s*=\s*1040;/, "t.y >= 1220 {\n            t.y = 1220;");
c = c.replace(/act:\s*"hippie",\s*x:\s*rand\(200,\s*WORLD_W\s*-\s*200\),\s*y:\s*-120,\s*vy:\s*1800,\s*z:\s*[\d.]+,\s*scale:\s*[\d.]+/,
  `act: "hippie",\n      x: rand(220, WORLD_W - 220),\n      y: -120,\n      vy: 1800,\n      z: 0.68,\n      scale: 0.75`);

// ============================================================================
// 2. Rechter Busch: weg von der Laterne (von 815 nach 735 auf die freie Wiese)
// ============================================================================
c = c.replace(/const BUSHES = \[\s*[\s\S]*?\s*\];/m, `const BUSHES = [
  { x: 95, y: 1040, z: 0.28, scale: 0.50, w: 60, h: 38, facing: 1 },
  { x: 735, y: 1040, z: 0.28, scale: 0.50, w: 60, h: 38, facing: -1 }
];`);

// ============================================================================
// 3. Opa & Rocker: Exakt auf den Sandweg einordnen (y: 1270, z: 0.88)
// Kein Dahinter-Davor-Glitch mehr mit Talahons auf Rasen (z: 0.65) oder Weg (z: 0.88)!
// ============================================================================
// Opa Spawn
c = c.replace(
  /act:\s*"opa",[\s\S]*?y:\s*\d+,[\s\S]*?z:\s*[\d.]+,[\s\S]*?scale:\s*[\d.]+/,
  `act: "opa",\n      x: fromRight ? 960 : -80,\n      y: 1270,\n      vx: (fromRight ? -1 : 1) * speed,\n      z: 0.88,\n      facing: fromRight ? -1 : 1,\n      points: -50,\n      scale: 0.80`
);

// Rocker Spawn
c = c.replace(
  /act:\s*"rocker",[\s\S]*?y:\s*\d+,[\s\S]*?z:\s*[\d.]+,[\s\S]*?scale:\s*[\d.]+/,
  `act: "rocker",\n      x: fromRight ? 960 : -80,\n      y: 1265,\n      vx: (fromRight ? -1 : 1) * speed,\n      z: 0.88,\n      facing: fromRight ? -1 : 1,\n      points: 200,\n      scale: 0.80`
);

// ============================================================================
// 4. Robuste Tiefensortierung: Wer weiter unten steht (höheres Y), ist IMMER vorne!
// ============================================================================
c = c.replace(
  /const sorted = this\.targets\.slice\(\)\.sort\([^)]+\);/,
  `const sorted = this.targets.slice().sort((a, b) => {
      // Wenn der Höhenunterschied mehr als 8px beträgt, entscheidet die Bodenlinie (Y)
      if (Math.abs(a.y - b.y) > 8) return a.y - b.y;
      return (a.z ?? 0) - (b.z ?? 0);
    });`
);

fs.writeFileSync(file, c, "utf8");
console.log("✅ Tonne am Boden, Busch versetzt und Y/Z-Tiefensortierung gefixt!");
'

npm run build
