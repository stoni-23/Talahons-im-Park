#!/usr/bin/env bash
cd ~/spiel || exit 1

node - << 'NODE_EOF'
const fs = require('fs');
const path = require('path');

const screenPath = path.join(process.cwd(), 'src', 'components', 'game-screen.tsx');
if (!fs.existsSync(screenPath)) {
  console.log('Datei nicht gefunden:', screenPath);
  process.exit(1);
}

let code = fs.readFileSync(screenPath, 'utf8');

// 1. Menü-Container: Feste Begrenzung (max-w-[420px]), zentriert mit mx-auto
code = code.replace(
  /<div className="relative flex h-full w-full max-w-\[520px\] flex-col items-center gap-2\.5 overflow-y-auto px-6 pt-80 pb-12"[^>]*style=\{\{[\s\S]*?\}\}>/,
  `<div className="relative flex h-full w-full max-w-[420px] mx-auto flex-col items-center gap-2.5 overflow-y-auto px-4 pt-[min(42dvh,320px)] pb-12 shadow-2xl" style={{
        backgroundImage: "url('/bg_oben.jpg'), url('/bg_unten.jpg')",
        backgroundRepeat: "no-repeat, repeat-y",
        backgroundSize: "100% auto, 100% auto",
        backgroundPosition: "center top, center top",
        backgroundAttachment: "local, local",
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch"
      }}>`
);

// Fallback für Container-Klasse
code = code.replace(
  /className="relative flex h-full w-full max-w-\[520px\] flex-col items-center gap-2\.5 overflow-y-auto px-6 pt-80 pb-12"/g,
  'className="relative flex h-full w-full max-w-[420px] mx-auto flex-col items-center gap-2.5 overflow-y-auto px-4 pt-[min(42dvh,320px)] pb-12"'
);

// 2. Button-Container bei nicht-eingeloggt: Auch auf max-w-[360px] begrenzen
code = code.replace(
  ': "my-2 flex justify-center w-full"}',
  ': "my-2 flex justify-center w-full max-w-[360px]"}'
);

fs.writeFileSync(screenPath, code, 'utf8');
console.log('✅ Menü-Kästchen auf einheitliche Breite gesetzt.');
NODE_EOF

npm run dev
