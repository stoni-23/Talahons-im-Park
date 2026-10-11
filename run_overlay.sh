cp /storage/emulated/0/Pictures/Photoroom/schilder.png public/assets/menu/schilder.png
node -e '
const fs = require("fs");
const file = "src/components/game-screen.tsx";
let c = fs.readFileSync(file, "utf8");
c = c.replace(/backgroundImage:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundSize:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundPosition:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundAttachment:\s*"[^"]*",?/g, "");
c = c.replace(/backgroundRepeat:\s*"[^"]*",?/g, "");
const marker = "touchAction: \"pan-y\",";
if (c.includes(marker)) {
  c = c.replace(marker, `backgroundImage: "url(/assets/menu/schilder.png), url(/assets/menu/menu.jpg)",\n        backgroundSize: "100% auto, 100% auto",\n        backgroundPosition: "center top, center top",\n        backgroundRepeat: "no-repeat, no-repeat",\n        ` + marker);
}
const markers = ["{/* --- 4 SCHILDER EXAKT AM PFAHL --- */}", "{/* --- 4 SCHILDER SAUBER AM PFAHL --- */}", "{/* --- 4 SCHILDER ORIGINAL AM PFAHL --- */}", "{/* --- HOLZSCHILDER-MENÜ AM PFAHL --- */}", "{/* --- HAUPT-AKTIONEN & SPÄTI KASTEN --- */}"];
let p1 = -1;
for (const m of markers) { p1 = c.indexOf(m); if (p1 !== -1) break; }
const p2 = c.indexOf("{/* Highscore Liste */}");
if (p1 !== -1 && p2 !== -1) {
  const overlayButtons = `{/* --- 4 KLICK-BUTTONS ÜBER SCHILDER-OVERLAY --- */}
              <div className="flex flex-col items-center gap-2 w-full max-w-[340px] mx-auto select-none my-1 z-20">
                <button type="button" disabled={!hud.ready} onClick={() => { unlockAudio(); engine?.start(); }} onTouchEnd={(e) => { e.stopPropagation(); if (hud.ready) { unlockAudio(); engine?.start(); } }} className="w-[290px] h-[62px] flex items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent rounded-lg">
                  <span className="font-pixel text-[13px] font-black tracking-wider text-[#221102] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">PARKBANK SPIELEN</span>
                </button>
                {profile.name && !isEditing ? (
                  <button type="button" onClick={handleStartTonnen} onTouchEnd={(e) => { e.stopPropagation(); handleStartTonnen(); }} className="w-[290px] h-[62px] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent leading-tight rounded-lg">
                    <span className="font-pixel text-[12px] font-black tracking-wider text-emerald-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🗑️ TONNEN-JAGD</span>
                    <span className="text-[10px] font-bold text-emerald-300 drop-shadow">{status.isFree ? \`Frei (\${status.freeRemaining}/3)\` : "Kosten: 1 🪙"}</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} onTouchEnd={(e) => { e.stopPropagation(); setIsEditing(true); }} className="w-[290px] h-[62px] flex items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent rounded-lg">
                    <span className="font-pixel text-[11px] font-bold text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🔒 ANMELDEN FÜR JAGD</span>
                  </button>
                )}
                <button type="button" onClick={() => { setKioskTab("shop"); setIsKioskOpen(true); }} onTouchEnd={(e) => { e.stopPropagation(); setKioskTab("shop"); setIsKioskOpen(true); }} className="w-[290px] h-[62px] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent leading-tight rounded-lg">
                  <span className="font-pixel text-[12px] font-black tracking-wider text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🏪 KIOSK & TASCHE</span>
                  <span className="text-[10px] font-bold text-yellow-300 drop-shadow">🪙 {profile?.groschen ?? 0} Groschen</span>
                </button>
                <button type="button" onClick={() => setIsMissionsOpen(true)} onTouchEnd={(e) => { e.stopPropagation(); setIsMissionsOpen(true); }} className="w-[290px] h-[62px] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer bg-transparent leading-tight rounded-lg">
                  <span className="font-pixel text-[12px] font-black tracking-wider text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🎯 AUFGABEN & BONI</span>
                  <span className="text-[10px] font-bold text-emerald-300 drop-shadow">Missionen & Belohnung</span>
                </button>
              </div>`;
  c = c.substring(0, p1) + overlayButtons + "\n\n        " + c.substring(p2);
  fs.writeFileSync(file, c, "utf8");
}
'
npm run build
