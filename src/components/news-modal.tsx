import React from "react";

export interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CURRENT_NEWS_VERSION = "2026.09.v4";

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl border-2 border-amber-700/80 p-4 sm:p-5 text-amber-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: "linear-gradient(180deg, #1f140e 0%, #110905 100%)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.9), inset 0 1px 2px rgba(245, 158, 11, 0.25)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">📢</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-300 uppercase leading-none">
                Park News & Updates
              </h2>
              <span className="text-[10px] text-stone-400 tracking-wider">OFFIZIELLES COMMUNITY UPDATE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/50 text-stone-400 hover:text-white border border-amber-900/40 active:scale-95 transition"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-3.5 overflow-y-auto pr-1 text-xs text-stone-300 leading-relaxed custom-scrollbar flex-1">
          
                    {/* NEUES MAP- & TONNEN-UPDATE */}
          <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500/70 bg-gradient-to-r from-emerald-950/80 via-stone-900 to-amber-950/70 shadow-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
                        {/* Tägliche Missionen News */}
          <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-950 p-3.5 space-y-2 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  NEU: Tägliche Missionen & Groschen-Jagd
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300">
                NEU
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Jeden Tag um Mitternacht (00:00 Uhr) erwarten dich 4 frische Aufgaben im Park! Schließe Missionen ab, sammle Groschen und hol dir exklusive Belohnungen im Kiosk.
            </p>
            <div className="space-y-1 text-[10.5px]">
              <div className="text-amber-200/90 font-medium">
                🪙 <span className="font-bold text-white">Groschen verdienen:</span> Hol dir täglich Extra-Münzen für deinen Highscore und deine Treffer.
              </div>
              <div className="text-amber-200/90 font-medium">
                🔄 <span className="font-bold text-white">Automatischer Reset:</span> Täglich um 00:00 Uhr mischt sich der Pool zufällig neu!
              </div>
            </div>
          </div>

<div className="flex items-center gap-1.5 font-black text-emerald-400 text-sm">
                <span>🌳</span>
                <span className="uppercase tracking-wide">NEUER HINTERGRUND: DER KLASSISCHE PARK & TONNEN-UPDATE</span>
              </div>
              <span className="bg-emerald-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow tracking-wider">
                NEU
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-200 leading-relaxed mb-2">
              Der Park erstrahlt in neuem Glanz! Der gesamte Hintergrund wurde komplett remastered – inklusive der gewaltigen Eiche, dem neuen Torbogen und knackscharfen Details.
            </p>
            <div className="border-t border-emerald-800/40 pt-2 text-[10px] sm:text-[11px] text-amber-200/90 space-y-1">
              <div>🎯 <strong>Tonnen-Modus remastered:</strong> Sauberes Arcade-Fächerlayout mit freier Schusslinie für Oma!</div>
              <div>🏮 <strong>Atmosphäre:</strong> Neue nostalgische Parklaterne für den perfekten Nacht-Vibe integriert.</div>
            </div>
          </div>

{/* 1. Willkommen & Community-Dank */}
          <div className="bg-gradient-to-r from-amber-950/70 to-stone-900/90 p-3.5 rounded-xl border border-amber-800/50 shadow-md">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm mb-1.5">
              <span>❤️</span>
              <span className="uppercase tracking-wide">Willkommen – Danke an die Community!</span>
            </div>
            <p className="text-stone-300 text-[11px] sm:text-xs">
              Dieses Spiel ist ein <strong>100% kostenloses Geschenk</strong> an euch alle da draußen! 
              Als riesiges Dankeschön für euren krassen Support, die Treue und den Hype um die Videos. 
              Keine versteckten Kosten, kein Pay-to-Win – einfach rein ins Spiel, Treffer ballern und Spaß haben!
            </p>
          </div>

          {/* 2. Werbebanner: Neuer Skin Goldene Parabellum */}
          <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/60 bg-stone-950/90 shadow-xl p-3">
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow tracking-wider animate-pulse">
                Ab Level 10
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-black text-yellow-400 text-sm mb-1">
              <span>👑</span>
              <span>NEUER SKIN: GOLDENE PARABELLUM</span>
            </div>
            
            <p className="text-[11px] text-stone-300 mb-2.5">
              Neu eingetroffen bei <strong className="text-amber-300">Oma unterm Strickzeug</strong>! 
              Schnapp dir den legendären Skin mit der vergoldeten Parabellum – exklusiv für wahre Park-Veteranen ab <strong>Level 10</strong>.
            </p>

            {/* Bild / Banner Vorschau */}
            <div className="relative w-full h-28 sm:h-32 rounded-lg overflow-hidden border border-amber-700/50 bg-black/60 flex items-center justify-center">
              <img 
                src="/assets/oma-goldenpara.png" 
                alt="Goldene Parabellum Skin" 
                className="h-full max-h-28 w-auto object-contain drop-shadow-[0_4px_18px_rgba(245,158,11,0.6)] select-none pointer-events-none transition-transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex items-end p-2">
                <span className="text-[10px] font-bold text-amber-300">✨ Jetzt bei Oma freischalten</span>
              </div>
            </div>
          </div>

          {/* 3. Patchnotes & Frische Updates */}
          <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-900/40 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs uppercase tracking-wider mb-1 border-b border-amber-900/40 pb-1">
              <span>⚙️</span>
              <span>Die neuesten Park-Updates</span>
            </div>
            
            <div className="text-[11px] space-y-1.5 text-stone-300">
              <div>
                <strong className="text-amber-300">🎡 Glücksrad & Groschen:</strong> Nieten drastisch reduziert! Dreh das Rad nach den Tonnen und gewinne fette Groschen-Pakete und bis zu <strong>250 XP</strong>.
              </div>
              <div>
                <strong className="text-amber-300">🎵 Audio-Sync:</strong> Die Menü-Musik pausiert sauber im Tonnen-Modus und startet pünktlich von Sekunde 0.
              </div>
              <div>
                <strong className="text-amber-300">🎯 Statistik-Tracking:</strong> Gesamttreffer und Durchschnitt synchronisieren fehlerfrei mit Supabase.
              </div>
            </div>
          </div>

        </div>

                  {/* 4. Open Source & GitHub */}
          <div className="bg-gradient-to-r from-stone-900/90 to-neutral-900/90 p-3 rounded-xl border border-stone-700/60 shadow-md">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs uppercase tracking-wider mb-1.5">
              <span>💻</span>
              <span>Open Source & Mitmachen</span>
            </div>
            <p className="text-[11px] text-stone-300 mb-2.5">
              Du programmierst gerne, hast Ideen für neue Minispiele, Features oder möchtest Bugs fixen? 
              Das gesamte Projekt ist <strong>Open Source</strong>! Schau gerne im Repository vorbei, reiche Pull Requests ein oder lass einen Stern da:
            </p>
            <a
              href="https://github.com/stoni-23/Talahons-im-Park"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-200 border border-amber-500/40 rounded-lg font-bold text-[11px] transition shadow"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>Zum GitHub Repository ↗</span>
            </a>
          </div>

        {/* Footer Button */}
        <div className="mt-3 pt-2.5 border-t border-amber-900/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg border border-amber-400/30 transition transform active:scale-95 uppercase tracking-wider text-xs"
          >
            Ehre, ab in den Park!
          </button>
        </div>
      </div>
    </div>
  );
};
