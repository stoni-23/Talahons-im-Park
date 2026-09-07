const fs = require("fs");
const { execSync } = require("child_process");

console.log("=== Schritt 1: src/game/engine.ts anpassen ===");
const enginePath = "src/game/engine.ts";
let engineCode = fs.readFileSync(enginePath, "utf8");

if (!engineCode.includes("crosshairColor: string")) {
  engineCode = engineCode.replace(
    /class GameEngine \{/,
    `class GameEngine {\n  crosshairColor: string = "#ffffff";\n\n  setCrosshairColor(color: string) {\n    if (color && typeof color === "string") {\n      this.crosshairColor = color;\n    }\n  }\n`
  );
  console.log("  [+] crosshairColor und setCrosshairColor in GameEngine registriert.");
}

const drawCrosshairOld = `    ctx.save();
    ctx.strokeStyle = "#f3ead8";
    ctx.fillStyle = "#f3ead8";`;

const drawCrosshairNew = `    ctx.save();
    const cColor = this.crosshairColor || "#ffffff";
    ctx.strokeStyle = cColor;
    ctx.fillStyle = cColor;`;

if (engineCode.includes(drawCrosshairOld)) {
  engineCode = engineCode.replace(drawCrosshairOld, drawCrosshairNew);
  console.log("  [+] drawCrosshair nutzt jetzt die dynamische Visier-Farbe.");
} else {
  engineCode = engineCode.replace(
    /ctx\.save\(\);\s*ctx\.strokeStyle\s*=\s*"#f3ead8";\s*ctx\.fillStyle\s*=\s*"#f3ead8";/,
    drawCrosshairNew
  );
  console.log("  [+] drawCrosshair via Regex aktualisiert.");
}
fs.writeFileSync(enginePath, engineCode, "utf8");

console.log("\n=== Schritt 2: src/components/game-screen.tsx anpassen ===");
const screenPath = "src/components/game-screen.tsx";
let screenCode = fs.readFileSync(screenPath, "utf8");

if (!screenCode.includes("getActiveCrosshairColor")) {
  if (screenCode.includes('from "@/lib/shop"')) {
    screenCode = screenCode.replace(
      /import\s*\{([^}]+)\}\s*from\s*"@\/lib\/shop";/,
      `import { $1, getActiveCrosshairColor } from "@/lib/shop";`
    );
  } else {
    screenCode = `import { getActiveCrosshairColor } from "@/lib/shop";\n` + screenCode;
  }
  console.log("  [+] getActiveCrosshairColor importiert.");
}

if (!screenCode.includes("engine.setCrosshairColor")) {
  screenCode = screenCode.replace(
    /const engine = new GameEngine\(canvas, setHud\);/,
    `const engine = new GameEngine(canvas, setHud);\n    if (profile?.equipped) {\n      engine.setCrosshairColor(getActiveCrosshairColor(profile.equipped));\n    }`
  );
  console.log("  [+] Engine-Start mit Visier-Farbe gekoppelt.");
}

fs.writeFileSync(screenPath, screenCode, "utf8");

console.log("\n=== Schritt 3: Vite Build testen ===");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Fadenkreuz-System & geräteübergreifende Synchronisation sauber bereit!");
} catch (e) {
  console.error("\n❌ Fehler beim Build!");
  process.exit(1);
}
