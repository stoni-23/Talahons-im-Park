import React, { useState } from "react";
export const SkinPreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; type?: "skin" | "visier"; idleSrc?: string; shootSrc?: string; crosshairColor?: string; }> = ({ isOpen, onClose, title, type = "skin", idleSrc = "", shootSrc = "", crosshairColor = "#ffffff" }) => {
  const [isShooting, setIsShooting] = useState(false);
  const triggerShot = () => { if (isShooting) return; setIsShooting(true); setTimeout(() => setIsShooting(false), 180); };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="relative w-72 rounded-2xl border-2 border-amber-500 bg-neutral-900 p-4 shadow-2xl text-center flex flex-col items-center select-none" onClick={(e) => { e.stopPropagation(); triggerShot(); }}>
        <button type="button" onClick={onClose} className="absolute top-2 right-2.5 text-neutral-400 hover:text-white text-base font-bold w-7 h-7 flex items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">✕</button>
        <h3 className="text-amber-400 font-black text-sm uppercase tracking-wider mb-2 pr-6">{title}</h3>
        <div className="relative w-full h-52 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 flex items-end justify-center shadow-inner cursor-pointer">
          <div className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none" style={{ backgroundImage: "url('/assets/park-bg.jpg')" }} />
          {type === "skin" && (<>
            {isShooting && <div className="absolute top-10 w-24 h-24 rounded-full bg-amber-400/30 blur-xl pointer-events-none animate-ping" />}
            <img src={isShooting ? shootSrc : idleSrc} alt={title} className="relative z-10 h-48 object-contain object-bottom pointer-events-none" draggable={false} />
          </>)}
          {type === "visier" && (
            <div className="relative z-10 flex items-center justify-center self-center h-full">
              {isShooting && <div className="absolute w-14 h-14 rounded-full blur-md animate-ping pointer-events-none opacity-80" style={{ backgroundColor: crosshairColor }} />}
              <div className={`relative flex items-center justify-center transition-all duration-75 ${isShooting ? "scale-125" : "scale-100"}`}>
                <div className="w-14 h-14 rounded-full border border-dashed opacity-50" style={{ borderColor: crosshairColor }} />
                <div className="absolute w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: crosshairColor }} />
                <div className="absolute w-0.5 h-3 transition-transform duration-75" style={{ backgroundColor: crosshairColor, transform: isShooting ? "translateY(-14px)" : "translateY(-9px)" }} />
                <div className="absolute w-0.5 h-3 transition-transform duration-75" style={{ backgroundColor: crosshairColor, transform: isShooting ? "translateY(14px)" : "translateY(9px)" }} />
                <div className="absolute h-0.5 w-3 transition-transform duration-75" style={{ backgroundColor: crosshairColor, transform: isShooting ? "translateX(-14px)" : "translateX(-9px)" }} />
                <div className="absolute h-0.5 w-3 transition-transform duration-75" style={{ backgroundColor: crosshairColor, transform: isShooting ? "translateX(14px)" : "translateX(9px)" }} />
              </div>
            </div>
          )}
        </div>
        <p className="text-[11px] text-amber-300 font-bold mt-2.5">👉 Tippe zum Schießen!</p>
        <button type="button" onClick={onClose} className="mt-2.5 w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700">Zurück zur Auswahl</button>
      </div>
    </div>
  );
};