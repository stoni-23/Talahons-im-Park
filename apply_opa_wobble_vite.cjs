const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/game/engine.ts";
if (!fs.existsSync(file)) {
  console.error("Fehler: src/game/engine.ts existiert nicht!");
  process.exit(1);
}

fs.copyFileSync(file, file + ".bak");
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  /if\s*\(t\.act\s*===\s*"opa"\)\s*\{[\s\S]*?return\s+this\.img\([^;]+\);?\s*\}/,
  `if (t.act === "opa") {
      const showHit = t.state === "falling" && t.phase !== "leave";
      return this.img(showHit ? "opa_hit" : "opa_walk");
    }`
);

const targetWalk = `      if (t.act === "walk" || t.act === "run" || t.act === "rocker" || t.act === "opa") {
        t.x += t.vx * dt;
        continue;
      }`;

const newWalk = `      if (t.act === "opa") {
        t.phaseT += dt;
        t.x += t.vx * dt;
        t.rot = Math.sin(t.phaseT * 5) * 0.04;
        t.y = 1180 + Math.abs(Math.sin(t.phaseT * 5)) * 3;
        continue;
      }
      if (t.act === "walk" || t.act === "run" || t.act === "rocker") {
        t.x += t.vx * dt;
        continue;
      }`;

if (code.includes(targetWalk)) {
  code = code.replace(targetWalk, newWalk);
} else {
  code = code.replace(
    /if\s*\(\s*t\.act\s*===\s*"walk"\s*\|\|\s*t\.act\s*===\s*"run"\s*\|\|\s*t\.act\s*===\s*"rocker"\s*\|\|\s*t\.act\s*===\s*"opa"\s*\)\s*\{\s*t\.x\s*\+=\s*t\.vx\s*\*\s*dt;\s*continue;\s*\}/,
    newWalk
  );
}

fs.writeFileSync(file, code, "utf8");

console.log("Baue Projekt mit Vite...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n✅ PERFEKT: Vite-Build erfolgreich abgeschlossen!");
} catch {
  console.error("Vite-Build fehlgeschlagen! Backup wird wiederhergestellt...");
  fs.copyFileSync(file + ".bak", file);
  process.exit(1);
}
