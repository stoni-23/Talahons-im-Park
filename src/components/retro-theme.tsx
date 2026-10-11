import React from 'react';

export const RetroThemeStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    .font-pixel { font-family: 'Press Start 2P', monospace; }
    .retro-text-shadow {
      text-shadow: 2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000;
    }
    .sign-park-green {
      background-color: #1c3f3b;
      border: 2px solid #ffffff;
      box-shadow: inset 0 0 0 1px #000, 0 4px 0 #0f2220;
    }
    .sign-wood {
      background: linear-gradient(180deg, #3a2211 0%, #241408 100%);
      border: 1px solid rgba(252, 211, 77, 0.8);
      box-shadow: 0 2px 0 #000, inset 0 0 4px rgba(0,0,0,0.6);
    }
    .sign-dark {
      background-color: rgba(18, 12, 8, 0.88);
      border: 1.5px solid #4a2e1b;
      box-shadow: inset 0 0 0 1px #150a04, 0 3px 0 #0d0603;
    }
    .retro-btn-gold {
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
      border: 2px solid #fef3c7;
      box-shadow: 0 5px 0 #78350f;
    }
    .retro-btn-gold:active { transform: translateY(3px); box-shadow: 0 2px 0 #78350f; }
    .sign-tap:active { transform: translateY(2px); }
  `}</style>
);

interface SignProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'green' | 'wood' | 'dark';
  hasScrews?: boolean;
  onClick?: (e?: any) => void;
}

export const RetroSign: React.FC<SignProps> = ({
  children,
  className = '',
  variant = 'green',
  hasScrews = true,
  onClick,
}) => {
  const variantClass =
    variant === 'green'
      ? 'sign-park-green text-white'
      : variant === 'wood'
      ? 'sign-wood text-[#fcedc7]'
      : 'sign-dark text-[#e8d5b5]';

  return (
    <div
      onClick={onClick}
      className={`relative rounded ${variantClass} ${onClick ? 'cursor-pointer sign-tap' : ''} ${className}`}
    >
      {hasScrews && (
        <>
          <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_1px_#000]" />
          <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_1px_#000]" />
          <div className="absolute bottom-1 left-1.5 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_1px_#000]" />
          <div className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_1px_#000]" />
        </>
      )}
      {children}
    </div>
  );
};

export const WoodPostFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative w-full h-[100dvh] max-w-[calc(100dvh*9/16)] mx-auto overflow-hidden select-none bg-black flex flex-col justify-between p-2">
    <RetroThemeStyles />
    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-[#2a160b] via-[#54301b] to-[#241208] border-x-2 border-[#1a0c06] z-0 pointer-events-none" />
    <div className="relative z-10 w-full h-full flex flex-col justify-between py-1">
      {children}
    </div>
  </div>
);

export const PauseSignModal: React.FC<{ onResume: () => void; onToTitle: () => void }> = ({ onResume, onToTitle }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm select-none">
    <div className="w-full max-w-xs flex flex-col items-center gap-3">
      <RetroSign variant="green" className="w-full py-3 text-center">
        <h2 className="font-pixel text-xl text-yellow-300 retro-text-shadow tracking-widest uppercase">PAUSE</h2>
      </RetroSign>
      <button type="button" onClick={onResume} className="retro-btn-gold w-full py-3 rounded-lg font-pixel text-xs text-black uppercase font-black">
        ▶ WEITER
      </button>
      <RetroSign variant="wood" onClick={onToTitle} className="w-full py-2.5 text-center">
        <span className="font-pixel text-[11px] text-amber-200">🚪 HAUPTMENÜ</span>
      </RetroSign>
    </div>
  </div>
);
