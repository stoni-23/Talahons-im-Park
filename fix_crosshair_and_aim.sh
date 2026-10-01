#!/usr/bin/env bash
cd ~/spiel || exit 1

cat << 'INNEOF' > calibrate_aim.cjs
const fs = require('fs');
const path = require('path');

const tonnenPath = path.join(process.cwd(), 'src', 'components', 'tonnen-game.tsx');
if (fs.existsSync(tonnenPath)) {
  let tonnenCode = fs.readFileSync(tonnenPath, 'utf8');
  tonnenCode = tonnenCode.replace(
    /className=\{`w-full h-full max-w-\[520px\] object-cover sm:object-contain cursor-crosshair \$\{gameState !== "playing" \? "hidden" : "block"\}`\}/g,
    'className={`block shrink-0 origin-center cursor-crosshair ${gameState !== "playing" ? "hidden" : "block"}`} style={{ height: "100dvh", width: "calc(100dvh * 9 / 16)", maxWidth: "none", aspectRatio: "9 / 16" }}'
  );
  fs.writeFileSync(tonnenPath, tonnenCode, 'utf8');
  console.log('✅ Tonnen-Modus kalibriert.');
}

const enginePath = path.join(process.cwd(), 'src', 'game', 'engine.ts');
if (fs.existsSync(enginePath)) {
  let engCode = fs.readFileSync(enginePath, 'utf8');
  engCode = engCode.replace(
    /this\.canvas\.style\.width\s*=\s*"100%";\s*this\.canvas\.style\.height\s*=\s*"100%";/g,
    'this.canvas.style.height = "100dvh";\n    this.canvas.style.width = "calc(100dvh * 9 / 16)";\n    this.canvas.style.maxWidth = "none";\n    this.canvas.style.aspectRatio = "9 / 16";'
  );
  fs.writeFileSync(enginePath, engCode, 'utf8');
  console.log('✅ Engine-Canvas kalibriert.');
}

const screenPath = path.join(process.cwd(), 'src', 'components', 'game-screen.tsx');
if (fs.existsSync(screenPath)) {
  let screenCode = fs.readFileSync(screenPath, 'utf8');
  screenCode = screenCode.replace(
    /<canvas\s+ref=\{canvasRef\}[\s\S]*?\/>/,
    `<canvas
          ref={canvasRef}
          className="block shrink-0 origin-center"
          style={{
            cursor: playing ? "none" : "default",
            touchAction: "none",
            height: "100dvh",
            width: "calc(100dvh * 9 / 16)",
            maxWidth: "none",
            aspectRatio: "9 / 16"
          }}
        />`
  );
  fs.writeFileSync(screenPath, screenCode, 'utf8');
  console.log('✅ game-screen.tsx Canvas kalibriert.');
}
INNEOF

node calibrate_aim.cjs && rm -f calibrate_aim.cjs && npm run dev
