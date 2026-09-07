import fs from 'fs';
import path from 'path';

const screenPath = path.resolve('src/components/game-screen.tsx');
let screen = fs.readFileSync(screenPath, 'utf8');

screen = screen.replace(
  /<span className="ml-1 text-\[10px\] font-mono font-bold px-1\.5 py-0\.5 rounded bg-amber-500\/20 text-amber-300 border border-amber-500\/40 select-none">Lv\.[^<]+<\/span>/g,
  '<span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 select-none">Lv.{isMe ? getPlayerLevel(Math.max(profile.totalXp || 0, row.score)) : getPlayerLevel(row.score)}</span>'
);

fs.writeFileSync(screenPath, screen, 'utf8');
console.log('✓ Ranglisten-Level für alle Spieler erfolgreich nach Punkten vereinheitlicht.');
