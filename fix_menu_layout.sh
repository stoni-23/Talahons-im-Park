#!/bin/bash
set -e
node -e '
const fs = require("fs");
const file = "src/components/game-screen.tsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(/backgroundImage:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundSize:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundPosition:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundAttachment:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundRepeat:\s*"[^"]*",?/g, "");
c = c.replace(/\{\/\* FESTES HINTERGRUND-OVERLAY \*\/\}[\s\S]*?<\/div>\s*/g, "");
c = c.replace(/\{\/\* FESTER 9:16 HINTERGRUND \*\/\}[\s\S]*?<\/div>\s*/g, "");
const fixedBg = `{/* FESTES HINTERGRUND-OVERLAY */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
        style={{
          backgroundImage: "url(/assets/menu/schilder.png), url(/assets/menu/menu.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
`;
const titleMarker = "{hud.mode === \"title\" && (";
const titleIdx = c.indexOf(titleMarker);
if (titleIdx !== -1) {
  const nextDivIdx = c.indexOf(">", titleIdx);
  if (nextDivIdx !== -1) {
    c = c.slice(0, nextDivIdx + 1) + "\n      " + fixedBg + c.slice(nextDivIdx + 1);
  }
}
c = c.replace(/max-w-[340px]\s+mx-auto\s+rounded-2xl/g, "max-w-[280px] mx-auto rounded-lg");
c = c.replace(/max-w-[340px]\s+mx-auto\s+rounded-xl/g, "max-w-[280px] mx-auto rounded-lg");
c = c.replace(/className="w-full\s+rounded-lg\s+bg-black\/80\s+border\s+border-neutral-700\s+px-3\s+py-2/g, "className=\"w-full rounded bg-black/85 border border-neutral-700/80 px-2 py-1 text-xs h-7");
c = c.replace(/className="w-full\s+rounded-lg\s+bg-black\/80\s+border\s+border-neutral-700\s+px-3\s+py-1\.5/g, "className=\"w-full rounded bg-black/85 border border-neutral-700/80 px-2 py-1 text-xs h-7");
c = c.replace(/className="w-full\s+rounded-xl\s+bg-amber-100\s+text-black\s+font-pixel\s+font-black\s+py-2\.5/g, "className=\"w-full rounded-md bg-amber-100 text-black font-pixel font-black py-1 text-xs h-7");
c = c.replace(/className="w-full\s+rounded-lg\s+bg-amber-100\s+text-black\s+font-pixel\s+font-black\s+py-2/g, "className=\"w-full rounded-md bg-amber-100 text-black font-pixel font-black py-1 text-xs h-7");
const markers = [
  "{/* --- 4 KLICK-BUTTONS EXAKT AUF DEN SCHILDERN --- */}",
  "{/* --- 4 KLICK-BUTTONS ÜBER SCHILDER-OVERLAY --- */}",
  "{/* --- 4 SCHILDER EXAKT AM PFAHL --- */}",
  "{/* --- 4 SCHILDER SAUBER AM PFAHL --- */}",
  "{/* --- 4 SCHILDER ORIGINAL AM PFAHL --- */}",
  "{/* --- HOLZSCHILDER-MENÜ AM PFAHL --- */}",
  "{/* --- HAUPT-AKTIONEN & SPÄTI KASTEN --- */}"
];
let p1 = -1;
for (const m of markers) { p1 = c.indexOf(m); if (p1 !== -1) break; }
const p2 = c.indexOf("{/* Highscore Liste */}");
if (p1 !== -1 && p2 !== -1) {
  const overlayButtons = `{/* --- 4 KLICK-BUTTONS EXAKT AUF DEN SCHILDERN --- */}
              <div className="flex flex-col items-center w-full max-w-[340px] mx-auto select-none z-20 mt-4 mb-2">
                {profile.name && !isEditing ? (
                  <button type="button" onClick={handleStartTonnen} onTouchEnd={(e) => { e.stopPropagation(); handleStartTonnen(); }} className="w-[280px] h-[64px] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent pr-8 leading-tight">
                    <span className="font-pixel text-[13px] font-black tracking-wider text-emerald-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🗑️ TONNEN-JAGD</span>
                    <span className="text-[10px] font-bold text-emerald-300 drop-shadow">{status.isFree ? \`Frei (\${status.freeRemaining}/3)\` : "Kosten: 1 🪙"}</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} onTouchEnd={(e) => { e.stopPropagation(); setIsEditing(true); }} className="w-[280px] h-[64px] flex items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent pr-8">
                    <span className="font-pixel text-[11px] font-bold text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🔒 ANMELDEN FÜR JAGD</span>
                  </button>
                )}
                <button type="button" onClick={() => { setKioskTab("shop"); setIsKioskOpen(true); }} onTouchEnd={(e) => { e.stopPropagation(); setKioskTab("shop"); setIsKioskOpen(true); }} className="w-[280px] h-[64px] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent pl-8 leading-tight -mt-1">
                  <span className="font-pixel text-[13px] font-black tracking-wider text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🏪 KIOSK & TASCHE</span>
                  <span className="text-[10px] font-bold text-yellow-300 drop-shadow">🪙 {profile?.groschen ?? 0} Groschen</span>
                </button>
                <button type="button" disabled={!hud.ready} onClick={() => { unlockAudio(); engine?.start(); }} onTouchEnd={(e) => { e.stopPropagation(); if (hud.ready) { unlockAudio(); engine?.start(); } }} className="w-[280px] h-[64px] flex items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent pr-8 -mt-1">
                  <span className="font-pixel text-[14px] font-black tracking-wider text-[#221102] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">PARKBANK SPIELEN</span>
                </button>
                <button type="button" onClick={() => setIsMissionsOpen(true)} onTouchEnd={(e) => { e.stopPropagation(); setIsMissionsOpen(true); }} className="w-[280px] h-[64px] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent pl-8 leading-tight -mt-1">
                  <span className="font-pixel text-[13px] font-black tracking-wider text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🎯 AUFGABEN & BONI</span>
                  <span className="text-[10px] font-bold text-emerald-300 drop-shadow">Missionen & Belohnung</span>
                </button>
              </div>`;
  c = c.substring(0, p1) + overlayButtons + "\n\n        " + c.substring(p2);
}
fs.writeFileSync(file, c, "utf8");
console.log("FERTIG_GEBAUT");
'
npm run build
