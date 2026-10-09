import React, { useState, useEffect } from 'react';

interface StartScreenOverlayProps {
  onStart: () => void;
  bgImageSrc?: string;
}

export const StartScreenOverlay: React.FC<StartScreenOverlayProps> = ({
  onStart,
  bgImageSrc = '/talahons-start-screen.jpg',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isTonneOpen, setIsTonneOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTonneOpen(true);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  const handleStartClick = () => {
    setIsVisible(false);
    onStart();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-[100dvh] flex items-center justify-center bg-black overflow-hidden select-none p-0 m-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', monospace;
        }

        /* Vögel */
        @keyframes flyAcross1 {
          0% { transform: translate(-80px, 15px) scale(0.7); }
          50% { transform: translate(50vw, 5px) scale(0.75); }
          100% { transform: translate(110vw, 20px) scale(0.7); }
        }
        @keyframes flyAcross2 {
          0% { transform: translate(-100px, 35px) scale(0.5); }
          100% { transform: translate(110vw, 10px) scale(0.5); }
        }
        .bird-1 { animation: flyAcross1 15s linear infinite; }
        .bird-2 { animation: flyAcross2 21s linear infinite 5s; }

        /* Teppich Intro */
        @keyframes carpetIntro {
          0% {
            transform: translate(120%, -120%) scale(1.4) rotate(15deg);
            opacity: 0;
          }
          1% {
            opacity: 1;
          }
          65% {
            transform: translate(-8px, 12px) scale(0.98) rotate(-4deg);
          }
          85% {
            transform: translate(4px, -4px) scale(1.01) rotate(2deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes carpetHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-1.5deg); }
        }

        .carpet-anim {
          opacity: 0;
          animation: carpetIntro 1.2s cubic-bezier(0.18, 0.89, 0.32, 1.15) 1.5s forwards,
                     carpetHover 3s ease-in-out infinite 2.7s;
        }

        /* Tonne Wackeln */
        @keyframes tonneTopRattle {
          0%, 100% { transform: rotate(0deg) skewX(0deg); }
          12% { transform: rotate(-4.5deg) skewX(-2deg); }
          24% { transform: rotate(4.5deg) skewX(2deg); }
          36% { transform: rotate(-6deg) skewX(-3deg); }
          48% { transform: rotate(6deg) skewX(3deg); }
          60% { transform: rotate(-7deg) skewX(-3.5deg); }
          72% { transform: rotate(7deg) skewX(3.5deg); }
          84% { transform: rotate(-3deg) skewX(-1deg); }
          92% { transform: rotate(2deg) skewX(1deg); }
        }

        .tonne-top-wobble {
          transform-origin: 85% 100%;
          animation: tonneTopRattle 0.95s cubic-bezier(0.36, 0.07, 0.19, 0.97) 2.8s forwards;
        }

        /* Rauch am Teppich */
        @keyframes carpetSmoke {
          0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 0.85; }
          50% { transform: translate(14px, -24px) scale(1.3) rotate(35deg); opacity: 0.55; }
          100% { transform: translate(32px, -52px) scale(2) rotate(70deg); opacity: 0; }
        }
        .smoke-puff-1 { animation: carpetSmoke 2.2s ease-out infinite 1.5s; }
        .smoke-puff-2 { animation: carpetSmoke 2.6s ease-out infinite 2.2s; }
        .smoke-puff-3 { animation: carpetSmoke 2.4s ease-out infinite 2.9s; }

        /* Kakerlake */
        @keyframes cockroachCrawl {
          0% { transform: translateY(0px) rotate(-90deg); }
          20% { transform: translateY(-8px) rotate(-85deg); }
          40% { transform: translateY(-16px) rotate(-95deg); }
          50% { transform: translateY(-16px) rotate(-90deg); }
          75% { transform: translateY(-24px) rotate(-85deg); }
          90% { transform: translateY(-32px) rotate(-92deg); }
          100% { transform: translateY(0px) rotate(-90deg); }
        }
        .cockroach { animation: cockroachCrawl 5.5s ease-in-out infinite; }

        /* Schilder */
        @keyframes signFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .sign-float { animation: signFloat 3.5s ease-in-out infinite; }

        /* Start-Button Glow & Shimmer */
        @keyframes btnPulseAnimation {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(245,158,11,0.6)); }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 24px rgba(250,204,21,0.95)); }
        }
        .btn-animated { animation: btnPulseAnimation 1.8s ease-in-out infinite; }

        @keyframes btnShimmerSlide {
          0% { transform: translateX(-150%) skewX(-20deg); }
          30%, 100% { transform: translateX(250%) skewX(-20deg); }
        }
        .btn-shimmer { animation: btnShimmerSlide 2.6s ease-in-out infinite; }
      `}</style>

      {/* 9:16 Kasten */}
      <div className="relative h-full aspect-[9/16] max-w-[calc(100dvh*9/16)] w-full overflow-hidden bg-black shadow-2xl">
        
        {/* 1. Hintergrund */}
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
          <img
            src={bgImageSrc}
            alt="Talahons im Park"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* 2. Teppich */}
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none carpet-anim">
          <img
            src="/teppisch-home.png"
            alt="Teppich"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-[28%] right-[6%] w-16 h-20 pointer-events-none">
            <div className="smoke-puff-1 absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-400/60 blur-[2px]" />
            <div className="smoke-puff-2 absolute top-5 right-2 w-6 h-6 rounded-full bg-amber-500/50 blur-[2px]" />
            <div className="smoke-puff-3 absolute top-1 right-5 w-4 h-4 rounded-full bg-slate-300/50 blur-[1px]" />
          </div>
        </div>

        {/* 3. Einzel-Tonne */}
        <div
          className={`absolute -bottom-2 -right-2 z-20 pointer-events-none w-[37%] max-w-[170px] flex items-end justify-end ${
            !isTonneOpen ? 'tonne-top-wobble' : ''
          }`}
        >
          <img
            src={isTonneOpen ? '/tonne-auf-home.png' : '/tonne-zu-home.png'}
            alt="Tonne"
            className="w-full h-auto block object-contain object-bottom"
          />
        </div>

        {/* Vögel */}
        <div className="absolute top-0 left-0 w-full h-28 pointer-events-none z-30 overflow-hidden">
          <div className="bird-1 absolute text-[9px] font-pixel text-slate-800 opacity-75 tracking-tighter">
            v v
          </div>
          <div className="bird-2 absolute text-[7px] font-pixel text-slate-700 opacity-60 tracking-tighter">
            v
          </div>
        </div>

        {/* Kakerlake weiter links direkt auf der Tonne */}
        <div className="absolute bottom-[5%] right-[9%] w-6 h-8 pointer-events-none z-30 flex items-center justify-center">
          <div className="cockroach text-[13px] leading-none select-none drop-shadow-[1px_1px_1px_rgba(0,0,0,0.9)]">
            🪳
          </div>
        </div>

        {/* Straßenschild-Titel */}
        <div className="absolute top-6 left-0 right-0 z-40 px-3 flex flex-col items-center sign-float pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
            <div className="relative bg-[#1c3f3b] border-2 border-white rounded px-4 py-1.5 shadow-[inset_0_0_0_1px_#000,0_4px_0_#0f2220]">
              <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white/70" />
              <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-white/70" />
              <div className="absolute bottom-1 left-1.5 w-1 h-1 rounded-full bg-white/70" />
              <div className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-white/70" />
              <h1
                className="font-pixel text-[19px] sm:text-[22px] text-white tracking-[0.16em] uppercase"
                style={{
                  textShadow:
                    '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                }}
              >
                TALAHONS
              </h1>
            </div>

            <div className="relative bg-[#1c3f3b] border-2 border-white rounded px-5 py-1 shadow-[inset_0_0_0_1px_#000,0_4px_0_#0f2220]">
              <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white/70" />
              <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-white/70" />
              <div className="absolute bottom-1 left-1.5 w-1 h-1 rounded-full bg-white/70" />
              <div className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-white/70" />
              <h2
                className="font-pixel text-[12px] sm:text-[14px] text-yellow-300 tracking-[0.25em] uppercase"
                style={{
                  textShadow:
                    '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                }}
              >
                IM PARK
              </h2>
            </div>

            <div className="relative bg-[#2d1b18] border border-amber-300/80 rounded px-3 py-0.5 mt-0.5 shadow-[0_2px_0_#000]">
              <span
                className="font-pixel text-[8px] sm:text-[9px] text-amber-200 tracking-[0.2em] uppercase"
                style={{
                  textShadow: '1px 1px 0px #000, -1px -1px 0px #000',
                }}
              >
                ★ PARABELLUM EDITION ★
              </span>
            </div>
          </div>
        </div>

        {/* Start-Button */}
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center items-center">
          <button
            onClick={handleStartClick}
            className="btn-animated relative overflow-hidden px-8 py-3.5 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-100 shadow-[0_5px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-transform cursor-pointer"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div className="btn-shimmer w-12 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>
            <span className="relative z-10 font-pixel text-zinc-950 text-xl tracking-widest uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
              START
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
