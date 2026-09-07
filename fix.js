const fs = require("fs");

// 1. game-screen.tsx wieder auf saubere Top 10 setzen
let scr = fs.readFileSync("src/components/game-screen.tsx", "utf8");
if (!scr.includes("fetchOnlineBoard")) {
  scr = scr.replace(
    /import\s*\{[^}]*\}\s*from\s*["\x27]@\/game\/scores["\x27];/,
    `import { qualifies, loadBoard, submitScore, fetchOnlineBoard, type ScoreEntry } from "@/game/scores";`
  );
}
scr = scr.replace(
  /if\s*\(\s*hud\.mode\s*===\s*["\x27]title["\x27]\s*\)\s*setBoard\(loadBoard\(\)\);/,
  `fetchOnlineBoard().then((b) => { if (b && b.length > 0) setBoard(b); });`
);
scr = scr.replace(/board\.slice\(0,\s*5\)/g, "board.slice(0, 10)");
scr = scr.replace(/Top 5/g, "Top 10");
scr = scr.replace(
  /setBoard\(submitScore\(name,\s*hud\.score\)\);/,
  `submitScore(name, hud.score).then((res) => setBoard(res));`
);
fs.writeFileSync("src/components/game-screen.tsx", scr);

// 2. engine.ts pruefen ob glockeImg eingebunden ist
let eng = fs.readFileSync("src/game/engine.ts", "utf8");
if (!eng.includes("glockeImg")) {
  eng = eng.replace(
    /hits:\s*number\s*=\s*0;/,
    `hits: number = 0;\n  glockeImg: HTMLImageElement = (() => { const img = new Image(); img.src = "/assets/glocke.png"; return img; })();`
  );
  fs.writeFileSync("src/game/engine.ts", eng);
}
