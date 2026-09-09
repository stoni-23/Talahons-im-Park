import React from "react";
import { DAILY_REWARD_DAYS, getDailyRewardStatus } from "@/lib/daily-reward";
import type { PlayerProfile } from "@/lib/profile";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onClaim: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  profile,
  onClaim
}) => {
  if (!isOpen) return null;

  const status = getDailyRewardStatus(profile);
  const [claimedSession, setClaimedSession] = React.useState(false);

  const canClaimNow = Boolean(status.canClaim) && !claimedSession;

  const handleClickClaim = () => {
    if (!canClaimNow) return;
    setClaimedSession(true);
    onClaim();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-line bg-ink p-5 text-center shadow-2xl">
        <p className="font-display text-2xl tracking-wide text-paper flex items-center gap-2">
          🎁 7-Tage Login-Bonus
        </p>
        <p className="mt-1 text-xs text-paper-dim">
          Komm jeden Tag vorbei für Groschen, XP und an Tag 7 das exklusive 🕊️ Tauben-Flüsterer Badge!
        </p>

        <div className="my-4 grid grid-cols-4 gap-2 w-full">
          {DAILY_REWARD_DAYS.map((item) => {
            const isClaimed = item.day <= status.streak;
            const isTodayTarget = item.day === status.canClaim && !claimedSession;
            const isDay7 = item.day === 7;

            let cardStyle =
              "flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all ";
            if (isDay7) {
              cardStyle += "col-span-2 ";
            }

            if (isClaimed) {
              cardStyle += "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 opacity-80";
            } else if (isTodayTarget) {
              cardStyle += "bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 animate-pulse";
            } else {
              cardStyle += "bg-ink-3 border-line text-paper-dim opacity-60";
            }

            return (
              <div key={item.day} className={cardStyle}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Tag {item.day}
                </span>
                <span className={`text-2xl my-1 select-none ${isDay7 ? "text-3xl" : ""}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold leading-tight line-clamp-2">
                  {item.label}
                </span>
                {isClaimed ? (
                  <span className="mt-1 text-[9px] font-bold text-emerald-400">✓ Erhalten</span>
                ) : isTodayTarget ? (
                  <span className="mt-1 text-[9px] font-bold text-amber-300">HEUTE!</span>
                ) : (
                  <span className="mt-1 text-[9px] text-muted">Gesperrt</span>
                )}
              </div>
            );
          })}
        </div>

        {canClaimNow ? (
          <button
            type="button"
            onClick={handleClickClaim}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-ink font-bold text-sm tracking-wide shadow-lg active:scale-95 transition cursor-pointer"
          >
            🎁 Tag {status.canClaim} Belohnung abholen!
          </button>
        ) : (
          <div className="w-full py-2 rounded-xl bg-ink-3 border border-line text-xs font-medium text-paper-dim">
            ✓ Heutige Belohnung bereits abgeholt! Morgen gehts weiter.
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-paper-dim hover:text-paper underline cursor-pointer"
        >
          Schließen
        </button>
      </div>
    </div>
  );
};
