cd ~/spiel && bash -c "$(cat << 'EOF'
cat << 'INNER' > src/components/news-modal.tsx
import React from "react";

export interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CURRENT_NEWS_VERSION = "2026.09.v2";

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-2xl border-2 border-amber-800/80 p-5 text-amber-100 shadow-2xl"
        style={{
          background: "linear-gradient(180deg, #1c140e 0%, #120b08 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.8), inset 0 1px 1px rgba(245, 158, 11, 0.2)"
        }}
      >
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">📢</span>
            <h2 className="text-lg font-bold tracking-wide text-amber-300 uppercase">Neuigkeiten & Update</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/40 text-stone-400 hover:text-white border border-amber-900/40 active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 text-xs text-stone-300 leading-relaxed">
          <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-900/40">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm mb-1">
              <span>🎡</span>
              <span>Glücksrad-Upgrade!</span>
            </div>
            <p className="text-stone-300">
              Die Nieten wurden drastisch reduziert! Ab sofort erwarten dich viel fettere Gewinne:
              bis zu <strong className="text-amber-300">10 Coins</strong> und <strong className="text-amber-300">250 XP</strong> warten auf dich.
            </p>
          </div>

          <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-900/40">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm mb-1">
              <span>🎵</span>
              <span>Sound & Audio-Fix</span>
            </div>
            <p className="text-stone-300">
              Die Musik stoppt beim Tonnen-Modus und startet sauber von Sekunde 0, sobald du ins Hauptmenü zurückkehrst.
            </p>
          </div>

          <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-900/40">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm mb-1">
              <span>🎯</span>
              <span>Ranglisten & Treffer</span>
            </div>
            <p className="text-stone-300">
              Deine Trefferstatistik und Durchschnitte synchronisieren nun fehlerfrei mit Supabase.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-900/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg border border-amber-400/30 transition transform active:scale-95 uppercase tracking-wider text-xs"
          >
            Alles klar, weiterballern!
          </button>
        </div>
      </div>
    </div>
  );
};
INNER

node -e '
const fs = require("fs");
const file = "src/components/tonnen-game.tsx";
let content = fs.readFileSync(file, "utf8");
const oldSectorsRegex = /const WHEEL_SECTORS = \[[\s\S]*?\];/;
const newSectors = `const WHEEL_SECTORS = [
  { label: "1 COIN", icon: "🪙", color: "#f59e0b", textColor: "#000", coins: 1, xp: 25, extra: false, weight: 22 },
  { label: "50 XP", icon: "⚡", color: "#10b981", textColor: "#000", coins: 0, xp: 50, extra: false, weight: 10 },
  { label: "+1 DREH", icon: "🔄", color: "#3b82f6", textColor: "#fff", coins: 0, xp: 0, extra: true, weight: 15 },
  { label: "3 COINS", icon: "💰", color: "#d97706", textColor: "#fff", coins: 3, xp: 50, extra: false, weight: 18 },
  { label: "100 XP", icon: "⚡", color: "#059669", textColor: "#fff", coins: 0, xp: 100, extra: false, weight: 10 },
  { label: "JACKPOT", icon: "👑", color: "#ef4444", textColor: "#fff", coins: 10, xp: 250, extra: false, weight: 8 },
  { label: "5 COINS", icon: "💎", color: "#8b5cf6", textColor: "#fff", coins: 5, xp: 100, extra: false, weight: 12 },
  { label: "NIETE", icon: "🍂", color: "#262626", textColor: "#9ca3af", coins: 0, xp: 0, extra: false, weight: 5 },
];`;
if (oldSectorsRegex.test(content)) {
  content = content.replace(oldSectorsRegex, newSectors);
  fs.writeFileSync(file, content, "utf8");
  console.log("✅ Glücksrad geupdatet!");
}
'

node -e '
const fs = require("fs");
const file = "src/components/game-screen.tsx";
let content = fs.readFileSync(file, "utf8");

if (!content.includes("from \"./news-modal\"") && !content.includes("from '\''./news-modal'\''")) {
  content = content.replace(
    /import React.*?from "react";/,
    (match) => `${match}\nimport { NewsModal, CURRENT_NEWS_VERSION } from "./news-modal";`
  );
}

if (!content.includes("isNewsOpen")) {
  content = content.replace(
    /const \[isTonnenOpen, setIsTonnenOpen\] = React\.useState\(false\);/,
    `const [isTonnenOpen, setIsTonnenOpen] = React.useState(false);\n  const [isNewsOpen, setIsNewsOpen] = React.useState(false);\n\n  React.useEffect(() => {\n    const seen = localStorage.getItem("last_seen_news_version");\n    if (seen !== CURRENT_NEWS_VERSION && hud.mode === "title") {\n      setIsNewsOpen(true);\n      localStorage.setItem("last_seen_news_version", CURRENT_NEWS_VERSION);\n    }\n  }, [hud.mode]);`
  );
}

if (!content.includes("setIsNewsOpen(true)")) {
  const soundBtnPattern = /(<button[\s\S]*?aria-label="Ton an\/aus"[\s\S]*?<\/button>)/;
  const newsButtonSnippet = `$1\n              {/* News / Update Button */}\n              <button\n                type="button"\n                onClick={() => setIsNewsOpen(true)}\n                aria-label="Neuigkeiten"\n                className="absolute top-24 right-6 z-30 flex h-11 px-3 items-center justify-center gap-1.5 rounded-2xl border border-amber-900/40 bg-black/30 text-amber-300 font-bold text-xs shadow-lg backdrop-blur-[2px] transition-transform active:scale-90 hover:bg-black/40"\n              >\n                <span className="text-base">📢</span>\n                <span>News</span>\n              </button>`;
  content = content.replace(soundBtnPattern, newsButtonSnippet);
}

if (!content.includes("<NewsModal")) {
  const tonnenPattern = /(<TonnenGame[\s\S]*?\/>\s*\}\s*\))/;
  content = content.replace(
    tonnenPattern,
    `$1\n        <NewsModal isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />`
  );
}

fs.writeFileSync(file, content, "utf8");
console.log("✅ game-screen.tsx geupdatet!");
'

npm run build
