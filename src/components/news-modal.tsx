import React from "react";

export interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CURRENT_NEWS_VERSION = "2026.10.5";

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
        <div className="space-y-3 overflow-y-auto pr-1 text-xs leading-relaxed text-stone-300 flex-1">
          <div className="rounded-xl border border-amber-500/50 bg-amber-950/40 p-3">
            <p className="text-sm font-black uppercase tracking-wide text-amber-300">Menü-Update · Beta 2026.10.5</p>
            <p className="mt-1">Der Park hat einen Wegweiser. Profil geht nach oben, Spielen nach rechts, Aufträge unter die Erde. Level, Groschen und XP bleiben gespeichert.</p>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            <li>📅 Täglich neue Missionen und der 7-Tage-Bonus.</li>
            <li>🪙 Groschen aus Missionen, XP aus dem Standard. Danach ein kurzer Hinweis im Menü.</li>
            <li>🟢 Giftgrün-Visier nach den Park-Missionen.</li>
            <li>🛢️ Tonnen-Modus ab Level 5, danach das Glücksrad.</li>
          </ul>
          <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/60 bg-stone-950/90 p-3 shadow-xl">
            <span className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-stone-950">
              Ab Level 10
            </span>
            <p className="pr-16 text-sm font-black text-yellow-400">👑 NEUER SKIN: GOLDENE PARABELLUM</p>
            <p className="mt-1 text-[11px] text-stone-300">
              Legendärer Skin mit der vergoldeten Parabellum. Exklusiv ab <strong>Level 10</strong> im Kiosk.
            </p>
            <div className="relative mt-2 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-amber-700/50 bg-black/60">
              <img src="/assets/oma-goldenpara.png" alt="Goldene Parabellum" className="h-full max-h-28 w-auto object-contain" />
            </div>
          </div>
          <div className="rounded-xl border border-stone-700/60 bg-stone-900/90 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">💻 Open Source & Mitmachen</p>
            <p className="mt-1 text-[11px] text-stone-300">
              Das Projekt ist Open Source. Ideen, Minispiele oder Bugfixes kannst du als Pull Request schicken oder einen Stern dalassen.
            </p>
            <a
              href="https://github.com/stoni-23/Talahons-im-Park"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center rounded-lg border border-amber-500/40 bg-stone-800 py-2 text-[11px] font-bold text-amber-200"
            >
              Zum GitHub Repository ↗
            </a>
          </div>
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
