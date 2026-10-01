#!/usr/bin/env bash
cd ~/spiel || exit 1

cat << 'NODE_EOF' > update_screen.cjs
const fs = require('fs');
const path = require('path');

const screenPath = path.join(process.cwd(), 'src', 'components', 'game-screen.tsx');
if (!fs.existsSync(screenPath)) {
  console.log('❌ Datei nicht gefunden:', screenPath);
  process.exit(1);
}

let code = fs.readFileSync(screenPath, 'utf8');

// 1. Container exakt wie Schanze: height 100dvh, width min(100vw, calc(100dvh * 9 / 16))
code = code.replace(
  /width:\s*"calc\(100dvh \* 9 \/ 16\)"/g,
  'width: "min(100vw, calc(100dvh * 9 / 16))"'
);

// 2. Menü-Kästen einheitlich anpassen (95% Breite, maximal 480px)
code = code.replace(/max-w-\[360px\]/g, 'w-[95%] max-w-[480px]');
code = code.replace(/max-w-\[520px\]/g, 'w-[95%] max-w-[480px]');

fs.writeFileSync(screenPath, code, 'utf8');
console.log('✅ Schanze-Maße erfolgreich übernommen!');
NODE_EOF

node update_screen.cjs && rm -f update_screen.cjs && npm run dev
