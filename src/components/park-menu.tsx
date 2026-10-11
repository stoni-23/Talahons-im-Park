import { useEffect, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { getActiveBadgeIcon } from "@/lib/shop";
import { getDailyRewardStatus } from "@/lib/daily-reward";
import { getLevelProgress, getPlayerLevel, getTonnenPlayStatus, type PlayerProfile } from "@/lib/profile";
import type { Mission } from "@/lib/missions";
import type { ScoreEntry } from "@/game/scores";

type View = "home" | "play" | "hub" | "board" | "level" | "rules";
type BoardTab = "profil" | "highscore" | "xp";

function SignButton({
  src,
  label,
  sub,
  arrow,
  onClick,
  disabled,
  wiggle,
}: {
  src: string;
  label: string;
  sub?: string;
  arrow: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  wiggle?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative block w-full cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-55 ${wiggle ? "sign-wiggle" : ""}`}
    >
      <img src={src} alt="" className="pointer-events-none block h-auto w-full drop-shadow-[0_8px_0_rgba(0,0,0,0.25)]" draggable={false} />
      <span
        className={`absolute inset-0 flex flex-col justify-center ${arrow === "right" ? "items-start pl-[8%] pr-[22%] text-left" : "items-end pr-[28%] pl-[26%] text-right"}`}
      >
        <span className="text-[18px] font-black leading-none tracking-wide text-white uppercase drop-shadow-[0_2px_0_#000]">
          {label}
        </span>
        {sub && (
          <span className="mt-1 max-w-full text-[13px] font-bold leading-tight text-amber-50 drop-shadow-[0_1px_0_#000]">
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}

function SkyPane() {
  return (
    <div className="relative h-full w-1/2 overflow-hidden">
      <img src="/menu/sky.jpg" alt="" className="absolute -top-3 -left-3 h-[calc(100%+24px)] w-[calc(100%+24px)] max-w-none object-cover object-bottom" />
      <div className="fog fog-a" />
      <div className="fog fog-b" />
      <span className="bird bird-1" />
      <span className="bird bird-2" />
      <span className="bird bird-3" />
    </div>
  );
}

function Leaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="leaf" style={{ left: `${8 + i * 10}%`, animationDelay: `${-i * 0.8}s`, animationDuration: `${6 + (i % 3)}s` }} />
      ))}
    </div>
  );
}

function Stage({ where, shake, post, children }: { where: "park" | "sky" | "ground" | "right"; shake: boolean; post?: ReactNode; children: ReactNode }) {
  const x = where === "right" ? "-50%" : "0%";
  const y = where === "sky" ? "0%" : where === "ground" ? "-66.666%" : "-33.333%";
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div className="relative h-full aspect-[9/16] w-full max-w-[calc(100dvh*9/16)] overflow-hidden bg-black">
        <div
          className="pointer-events-none absolute left-0 top-0 h-[300%] w-[200%] will-change-transform"
          style={{
            transform: `translate(${x}, ${y})`,
            transition: "transform 480ms cubic-bezier(.16,.84,.22,1)",
          }}
        >
          <div className={shake ? "world-shake h-full w-full" : "h-full w-full"}>
            <div className="flex h-1/3 w-full">
              <SkyPane />
              <SkyPane />
            </div>
            <div className="flex h-1/3 w-full">
              <div className="relative h-full w-1/2 overflow-hidden">
                <img src="/menu/park-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                {post}
              </div>
              <div className="relative h-full w-1/2 overflow-hidden">
                <img src="/menu/park-right.jpg" alt="" className="absolute -top-3 -left-3 h-[calc(100%+24px)] w-[calc(100%+24px)] max-w-none object-cover object-center" />
                <Leaves />
              </div>
            </div>
            <div className="flex h-1/3 w-full">
              <div className="relative h-full w-1/2 overflow-hidden">
                <img src="/menu/underground.jpg" alt="" className="absolute -top-3 -left-3 h-[calc(100%+24px)] w-[calc(100%+24px)] max-w-none object-cover object-top" />
              </div>
              <div className="relative h-full w-1/2 overflow-hidden">
                <img src="/menu/underground.jpg" alt="" className="absolute -top-3 -left-3 h-[calc(100%+24px)] w-[calc(100%+24px)] max-w-none object-cover object-top" />
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function PaperBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-[86%] max-w-md rounded-sm bg-[#f4e7c8] px-4 py-4 shadow-[0_10px_0_rgba(60,40,10,0.35)] ring-1 ring-[#c3ae86]">
      <p className="mb-3 text-center text-xs font-black tracking-[0.18em] text-[#6a4a28] uppercase">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function DirtBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-[88%] max-w-md rounded-md border-4 border-[#6a5038] bg-[#24180f]/95 px-4 py-4 shadow-[0_12px_0_rgba(0,0,0,0.5)]">
      <p className="mb-3 text-center text-xs font-black tracking-[0.16em] text-amber-200 uppercase">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function CloudShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto w-[92%] pt-9 ${className}`}>
      <div className="absolute top-3 left-[8%] z-0 h-12 w-24 rounded-full bg-white" />
      <div className="absolute top-0 left-[28%] z-0 h-14 w-32 rounded-full bg-white" />
      <div className="absolute top-2 right-[10%] z-0 h-12 w-24 rounded-full bg-white" />
      <div className="relative z-10 flex min-h-0 flex-col overflow-hidden rounded-[22px] border-4 border-white bg-[#1a120c]/92 shadow-[0_12px_0_rgba(20,50,90,0.35)]">
        {children}
      </div>
    </div>
  );
}

function CloudBtn({
  label,
  sub,
  onClick,
  disabled,
  tone,
}: {
  label: string;
  sub?: string;
  onClick: () => void;
  disabled?: boolean;
  tone: "green" | "amber" | "sky";
}) {
  const bg = tone === "green" ? "bg-emerald-700" : tone === "amber" ? "bg-amber-500 text-black" : "bg-sky-800";
  const subc = tone === "amber" ? "text-black/70" : "text-white/80";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 w-full flex-col items-start justify-center rounded-2xl px-4 py-2 text-left active:scale-[0.98] disabled:opacity-50 ${bg} ${tone === "amber" ? "" : "text-white"}`}
    >
      <span className="text-base font-black">{label}</span>
      {sub && <span className={`text-xs font-bold ${subc}`}>{sub}</span>}
    </button>
  );
}

function StatStrip({ profile }: { profile: PlayerProfile }) {
  const prog = getLevelProgress(profile.totalXp || 0);
  return (
    <div className="w-full shrink-0 border-b border-black/40 bg-[#102824]/92 px-3 pt-[max(8px,env(safe-area-inset-top))] pb-1.5">
      <div className="flex items-center justify-between gap-2 text-[12px] font-black text-white">
        <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[11px] text-black">Lv {prog.level}</span>
        <span className="min-w-0 flex-1 truncate text-center text-[11px] text-amber-200">{profile.name}</span>
        <span className="shrink-0">🪙 {profile.coins || 0}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-amber-100/80">
        <span>{prog.currentXp} XP</span>
        <span>Rekord {profile.highScore || 0}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/50">
        <div className="h-full bg-amber-400" style={{ width: `${prog.percent}%` }} />
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 rounded-full border border-white/50 bg-black/55 px-4 text-sm font-black text-white active:scale-95"
    >
      Zurück
    </button>
  );
}

function Dock({
  showBack,
  onBack,
  muted,
  onSound,
  onNews,
}: {
  showBack: boolean;
  onBack: () => void;
  muted: boolean;
  onSound: () => void;
  onNews: () => void;
}) {
  return (
    <div className="mt-auto flex w-full shrink-0 items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-black/25 px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
      {showBack ? <BackButton onClick={onBack} /> : <span />}
      <div className="flex gap-2">
        <button type="button" onClick={onSound} aria-label="Ton" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black/55 text-lg">{muted ? "🔇" : "🔊"}</button>
        <button type="button" onClick={onNews} aria-label="Ankündigung" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black/55 text-lg">📢</button>
      </div>
    </div>
  );
}

function RoundLogo() {
  return (
    <div className="logo-bob pointer-events-none relative h-[8rem] w-[8rem]">
      <img src="/logo.png" alt="" className="h-full w-full object-contain drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]" />
      <span className="logo-shine pointer-events-none absolute inset-[8%] rounded-full" />
    </div>
  );
}

function WoodBox({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-[92%] overflow-hidden rounded-md border-4 border-[#6b4423] bg-[#1a120c]/88 shadow-[0_8px_0_rgba(0,0,0,0.45)] ${className}`}>
      {children}
    </div>
  );
}

export function ParkMenu(props: {
  hudReady: boolean;
  profile: PlayerProfile;
  isEditing: boolean;
  profileInput: string;
  setProfileInput: (v: string) => void;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  authLoading: boolean;
  profileError: string | null;
  setProfileError: (v: string | null) => void;
  onAuth: () => void;
  onLogout: () => void;
  isSecured: boolean;
  claimPassword: string;
  setClaimPassword: (v: string) => void;
  claimError: string | null;
  setClaimError: (v: string | null) => void;
  onSecure: () => void;
  onStats: () => void;
  onPassword: () => void;
  missions: Mission[];
  dailyMissions: { completed?: boolean; claimed?: boolean }[];
  onMissions: () => void;
  onDaily: () => void;
  onShop: () => void;
  onBag: () => void;
  hasBagDot: boolean;
  onStartStandard: () => void;
  onStartTonnen: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onNews: () => void;
  board: ScoreEntry[];
  boardTab: "highscore" | "xp";
  setBoardTab: (t: "highscore" | "xp") => void;
  onInspect: (row: ScoreEntry) => void;
  chatMsgs: { name: string; text: string }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  chatRef: RefObject<HTMLDivElement | null>;
  onChat: (e: FormEvent) => void;
  onShare: () => void;
}) {
  const {
    hudReady, profile, isEditing, missions, dailyMissions,
  } = props;
  const [view, setView] = useState<View>("home");
  const [hubPage, setHubPage] = useState(0);
  const [tab, setTab] = useState<BoardTab>("profil");
  const [slide, setSlide] = useState(1);
  const [wiggle, setWiggle] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const loggedIn = Boolean(profile.name) && !isEditing;
  const prog = getLevelProgress(profile.totalXp || 0);
  const level = getPlayerLevel(profile.totalXp || 0);
  const tonnen = loggedIn ? getTonnenPlayStatus(profile) : null;
  const daily = getDailyRewardStatus(profile);
  const dailyClaimable = dailyMissions.filter((m) => m.completed && !m.claimed).length;
  const mainOpen = missions.filter((m) => m.completed && !m.claimed).length;
  const mainClaimed = missions.filter((m) => m.claimed).length;
  const laserClaimed = Array.isArray(profile.inventory) && profile.inventory.includes("visier_neon");
  const skinClaimed = Array.isArray(profile.inventory) && profile.inventory.includes("skin_golden_parabellum");
  const laserReady = !laserClaimed && missions.length > 0 && missions.every((m) => m.completed || m.claimed);
  const skinReady = !skinClaimed && level >= 10;
  const homeHint = !loggedIn
    ? ""
    : dailyClaimable + mainOpen > 0
      ? `${dailyClaimable + mainOpen} Groschen holen`
      : daily.canClaim
        ? "Login-Bonus holen"
        : laserReady
          ? "Giftgrün-Visier holen"
          : skinReady
            ? "Parabellum holen"
            : props.hasBagDot
              ? "Neues Teil in der Tasche"
              : dailyMissions.some((m) => !m.claimed) || missions.some((m) => !m.claimed)
                ? "Missionen offen"
                : "";

  const go = (next: View, dir = 1) => {
    setSlide(dir);
    setView(next);
  };

  const openBoard = (next: BoardTab) => {
    setTab(next);
    if (next === "highscore") props.setBoardTab("highscore");
    if (next === "xp") props.setBoardTab("xp");
    go("board", 1);
  };

  const press = (id: string, fn: () => void) => {
    setWiggle(id);
    window.setTimeout(() => {
      fn();
      setWiggle(null);
    }, 280);
  };

  const back = () => go(view === "level" || view === "rules" ? "hub" : "home", -1);

  const where: "park" | "sky" | "ground" | "right" =
    view === "play" ? "right" : view === "hub" || view === "level" || view === "rules" ? "ground" : view === "home" ? "park" : "sky";

  useEffect(() => {
    setShake(true);
    const s = window.setTimeout(() => setShake(false), 500);
    if (view === "home") {
      setShowPanel(false);
      return () => window.clearTimeout(s);
    }
    setShowPanel(false);
    const a = window.setTimeout(() => setShowPanel(true), 460);
    return () => {
      window.clearTimeout(s);
      window.clearTimeout(a);
    };
  }, [where]);

  return (
    <Stage
      where={where}
      shake={shake}
      post={
        <div className="absolute inset-0">
          <div className={`relative h-full w-full ${wiggle ? "sign-wiggle" : ""}`}>
            <img src="/menu/signpost.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center" draggable={false} />
            <div className="pointer-events-none absolute left-1/2 top-[10%] -translate-x-1/2">
              <RoundLogo />
            </div>
            <button type="button" disabled={!!wiggle} onClick={() => press("profil", () => openBoard("profil"))} className="pointer-events-auto absolute top-[30.2%] left-[37.5%] flex h-[7%] w-[34%] origin-left -rotate-[3.5deg] flex-col items-start justify-center text-left leading-none text-white">
              <span className="text-[22px] font-black uppercase drop-shadow-[0_2px_0_#000]">Profil</span>
              {!loggedIn && <span className="text-[13px] font-bold drop-shadow-[0_1px_0_#000]">Anmelden</span>}
            </button>
            <button type="button" disabled={!hudReady || !!wiggle} onClick={() => press("play", () => go("play", 1))} className="pointer-events-auto absolute top-[42.8%] left-[35.5%] flex h-[7%] w-[36%] origin-left -rotate-[2.5deg] flex-col items-start justify-center text-left leading-none text-white">
              <span className="text-[22px] font-black uppercase drop-shadow-[0_2px_0_#000]">{hudReady ? "Spielen" : "Laden…"}</span>
              <span className="text-[13px] font-bold drop-shadow-[0_1px_0_#000]">Standard · Tonnen</span>
            </button>
            <button type="button" disabled={!!wiggle} onClick={() => press("hub", () => { setHubPage(0); go("hub", 1); })} className="pointer-events-auto absolute top-[55%] left-[34.5%] flex h-[7%] w-[34%] origin-left -rotate-[2deg] flex-col items-start justify-center text-left leading-none text-white">
              <span className="text-[20px] font-black uppercase drop-shadow-[0_2px_0_#000]">Aufträge</span>
              <span className={`text-[12px] font-bold drop-shadow-[0_1px_0_#000] ${homeHint ? "text-amber-200" : ""}`}>{homeHint || "Missionen · Kiosk"}</span>
            </button>
          </div>
        </div>
      }
    >
      <style>{`
        @keyframes logoBob { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
        .logo-bob { animation: logoBob 3.2s ease-in-out infinite; }
        @keyframes logoShine { 0% { transform: translateX(-120%) skewX(-18deg); } 55%,100% { transform: translateX(220%) skewX(-18deg); } }
        .logo-shine { overflow: hidden; }
        .logo-shine::after { content: ""; position: absolute; top: -10%; bottom: -10%; left: 0; width: 28%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); animation: logoShine 3.6s ease-in-out infinite; }
        @keyframes signWiggle {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(1px, 0); }
          50% { transform: translate(-1px, 1px); }
          75% { transform: translate(1px, -1px); }
        }
        .sign-wiggle { animation: signWiggle .32s linear; }
        @keyframes worldShake {
          0%, 100% { transform: none; }
          40% { transform: translate(1px, -1px); }
          70% { transform: translate(-1px, 1px); }
        }
        .world-shake { animation: worldShake .48s linear; }
        .fog { position: absolute; height: 22%; width: 78%; border-radius: 999px; background: radial-gradient(ellipse at center, rgba(255,255,255,.5), rgba(255,255,255,0) 70%); filter: blur(8px); pointer-events: none; }
        .fog-a { top: 16%; left: -8%; animation: drift 16s ease-in-out infinite alternate; }
        .fog-b { top: 46%; left: 18%; opacity: .75; animation: drift 22s ease-in-out infinite alternate-reverse; }
        @keyframes drift { from { transform: translateX(0); } to { transform: translateX(16%); } }
        .bird { position: absolute; width: 16px; height: 16px; border-left: 2px solid rgba(12,32,58,.85); border-bottom: 2px solid rgba(12,32,58,.85); transform: rotate(-42deg); opacity: .8; }
        .bird-1 { top: 22%; animation: fly 15s linear infinite; }
        .bird-2 { top: 34%; animation: fly 19s linear infinite; animation-delay: -7s; }
        .bird-3 { top: 14%; width: 8px; height: 8px; opacity: .45; animation: fly 22s linear infinite; animation-delay: -3s; }
        @keyframes fly { from { left: -6%; } to { left: 108%; } }
        .leaf { position: absolute; top: -8%; width: 9px; height: 6px; background: #3d7a34; border-radius: 0 80% 0 80%; animation: fall linear infinite; }
        @keyframes fall { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(105vh) rotate(220deg); } }
      `}</style>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        {view === "home" && loggedIn && homeHint && (
          <button
            type="button"
            onClick={() => press("hub", () => { setHubPage(0); go("hub", 1); })}
            className="pointer-events-auto absolute bottom-20 left-1/2 z-20 -translate-x-1/2 animate-pulse rounded-full border-2 border-amber-300 bg-amber-400 px-4 py-2 text-sm font-black text-black shadow-lg"
          >
            {homeHint}
          </button>
        )}
        {loggedIn && <div className="pointer-events-auto"><StatStrip profile={profile} /></div>}
        <div className="relative flex min-h-0 flex-1 flex-col">
          {view === "play" && showPanel && (
            <div className="pointer-events-auto flex flex-1 items-end pb-16">
              <PaperBox title="Spielauswahl">
                <CloudBtn tone="green" label={hudReady ? "Standard" : "Laden…"} sub="XP, Rekord, Level" disabled={!hudReady} onClick={props.onStartStandard} />
                {!loggedIn ? (
                  <CloudBtn tone="amber" label="Tonnen" sub="Erst am Profil anmelden" disabled onClick={() => {}} />
                ) : level < 5 ? (
                  <CloudBtn tone="amber" label="Tonnen" sub={`Ab Level 5 · du bist ${level}`} disabled onClick={() => {}} />
                ) : (
                  <CloudBtn tone="amber" label="Tonnen" sub={tonnen?.isFree ? `Frei ${tonnen.freeRemaining}/3 · dann Glücksrad` : "1 Groschen · dann Glücksrad"} onClick={props.onStartTonnen} />
                )}
              </PaperBox>
            </div>
          )}

          {view === "hub" && showPanel && (
            <div className="pointer-events-auto flex flex-1 flex-col items-center justify-center">
              <DirtBox title="Aufträge">
                {hubPage === 0 ? (
                  <>
                    <CloudBtn tone="green" label="Missionen" sub={loggedIn ? `Park ${mainClaimed}/${missions.length || 5}${dailyClaimable ? ` · +${dailyClaimable} Groschen` : ""}` : "Erst anmelden"} onClick={() => (loggedIn ? props.onMissions() : openBoard("profil"))} />
                    <CloudBtn tone="sky" label="Tagesbonus" sub={daily.canClaim ? "Heute abholen" : `Tag ${daily.streak}/7`} onClick={() => (loggedIn ? props.onDaily() : openBoard("profil"))} />
                    <CloudBtn tone="amber" label="Kiosk" sub="Shop · Tasche · Selten bis Legendär" onClick={() => (loggedIn ? props.onShop() : openBoard("profil"))} />
                    <button type="button" onClick={() => go("level", 1)} className="rounded-2xl border border-amber-300/40 bg-black/35 px-3 py-2 text-left">
                      <span className="block text-xs font-black text-amber-200">🔫 Golden Parabellum · Legendär</span>
                      <span className="text-[11px] font-bold text-amber-100/80">{skinClaimed ? "Geholt" : skinReady ? "Abholen im Kiosk" : `Level ${level}/10`}</span>
                    </button>
                    <button type="button" onClick={() => (loggedIn ? props.onMissions() : openBoard("profil"))} className="rounded-2xl border border-emerald-400/40 bg-black/35 px-3 py-2 text-left">
                      <span className="block text-xs font-black text-emerald-200">🟢 Giftgrün-Visier</span>
                      <span className="text-[11px] font-bold text-emerald-100/80">{laserClaimed ? "In der Tasche" : laserReady ? "Jetzt holen" : `Park ${mainClaimed}/${missions.length || 5}`}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <CloudBtn tone="sky" label="Tasche" sub={props.hasBagDot ? "Neues Teil" : "Ausrüstung"} onClick={() => (loggedIn ? props.onBag() : openBoard("profil"))} />
                    <CloudBtn tone="amber" label="Level" sub={skinClaimed && laserClaimed ? "Gewinne geholt" : "Parabellum · Laser"} onClick={() => go("level", 1)} />
                    <CloudBtn tone="green" label="Regeln" sub="Punkte · Teilen" onClick={() => go("rules", 1)} />
                  </>
                )}
              </DirtBox>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setHubPage(0)} className={`h-11 min-w-11 rounded-full border border-white text-sm font-black ${hubPage === 0 ? "bg-white text-sky-800" : "bg-black/30 text-white"}`}>1</button>
                <button type="button" onClick={() => setHubPage(1)} className={`h-11 min-w-11 rounded-full border border-white text-sm font-black ${hubPage === 1 ? "bg-white text-sky-800" : "bg-black/30 text-white"}`}>2</button>
              </div>
            </div>
          )}

          {view === "level" && (
            <WoodBox className="pointer-events-auto mt-4 p-3">
              <p className="text-sm font-black tracking-wide text-amber-200">LEVEL & GEWINN</p>
              <button type="button" onClick={props.onShop} className="mt-3 w-full rounded border border-amber-700/60 bg-black/40 p-3 text-left">
                <div className="flex items-center justify-between text-sm font-black text-amber-200">
                  <span>🔫 Golden Parabellum</span>
                  <span>{skinClaimed ? "Geholt" : level >= 10 ? "Bereit" : `Lv. ${level}/10`}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-black/60">
                  <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (level / 10) * 100)}%` }} />
                </div>
              </button>
              <button type="button" onClick={props.onMissions} className="mt-2 w-full rounded border border-emerald-700/60 bg-black/40 p-3 text-left">
                <div className="flex items-center justify-between text-sm font-black text-emerald-200">
                  <span>🟢 Giftgrün-Laser</span>
                  <span>{laserClaimed ? "Geholt" : `${mainClaimed}/${missions.length || 5}`}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-black/60">
                  <div className="h-full bg-emerald-400" style={{ width: `${laserClaimed ? 100 : Math.min(100, (mainClaimed / Math.max(1, missions.length || 5)) * 100)}%` }} />
                </div>
              </button>
              <p className="mt-2 text-[11px] text-amber-100/80">Tippen öffnet Kiosk oder Missionen. Groschen und XP bleiben wie bisher.</p>
            </WoodBox>
          )}

          {view === "rules" && (
            <WoodBox className="pointer-events-auto mt-3 flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 text-[12px] text-amber-50">
                <p className="text-sm font-black tracking-wide text-amber-200">PUNKTE</p>
                <p>Mauer 35 · Wiese 22 · Weg 14 · Vorne 8</p>
                <p>Rennen +6 · Hinterm Tor 28 · Baum 26 · Busch 22</p>
                <p>🛴 Bahndidos 200 · ✨ Teppich 150</p>
                <p>🛢️ Offene Tonne 150 · 🚫 Zu −50</p>
                <p>🤘 Punk 120 · 🥫 Dose 80</p>
                <p>🧥 Opa −100 · 🦽 Rollstuhl −100 · ❌ Fehlschuss −15</p>
                <p>Kopfschuss: 2× plus 50. Combo gibt bis zu +150%.</p>
                <p>🧶 Stricknadel: ab 13 Treffern in Folge, 5 Sekunden Dauerfeuer.</p>
                <p className="pt-1 text-[11px] text-amber-100/80">Tippen zum Zielen · Im Kommando halten · Esc Pause</p>
                <p className="pt-2 text-[11px]">XP kommt aus dem Standard. Groschen aus Missionen. Das Glücksrad kommt nach dem Tonnen-Modus.</p>
                <div className="flex flex-wrap gap-2 pt-2 text-[12px] font-bold">
                  <a className="text-cyan-300" href="https://www.tiktok.com/@bankgeheimnisimpark" target="_blank" rel="noreferrer">TikTok</a>
                  <a className="text-blue-300" href="https://www.facebook.com/bankgeheimnisimpark" target="_blank" rel="noreferrer">Facebook</a>
                  <a className="text-pink-300" href="https://www.instagram.com/bankgeheimnisimpark" target="_blank" rel="noreferrer">Instagram</a>
                  <a className="text-red-300" href="https://www.youtube.com/@bankgeheimnisimpark" target="_blank" rel="noreferrer">YouTube</a>
                </div>
                <button type="button" onClick={props.onShare} className="mt-2 h-11 w-full rounded bg-amber-400 font-black text-black">Spiel teilen</button>
              </div>
            </WoodBox>
          )}

          {view === "board" && showPanel && (
            <CloudShell className="pointer-events-auto mt-3 flex max-h-[calc(100%-8px)] flex-col overflow-hidden">
              <div className="grid grid-cols-3 border-b-4 border-[#6b4423]">
                {([
                  ["profil", "PROFIL"],
                  ["highscore", "HIGHSCORE"],
                  ["xp", "RANG"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTab(id);
                      if (id === "xp") props.setBoardTab("xp");
                      if (id === "highscore") props.setBoardTab("highscore");
                    }}
                    className={`h-11 text-xs font-black tracking-wide ${tab === id ? "bg-amber-400 text-black" : "bg-black/40 text-amber-100"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="max-h-[62dvh] min-h-0 overflow-y-auto p-3">
                {tab === "profil" && (
                  <ProfilePane {...props} loggedIn={loggedIn} progPercent={prog.percent} progNeed={prog.needed} progIn={prog.progressInLevel} nextLv={prog.level + 1} />
                )}
                {tab !== "profil" && <BoardList board={props.board} tab={tab} me={profile.name} onInspect={props.onInspect} />}
              </div>
            </CloudShell>
          )}
        </div>
        <div className="pointer-events-auto">
        <Dock
          showBack={view !== "home"}
          onBack={back}
          muted={props.soundMuted}
          onSound={props.onToggleSound}
          onNews={props.onNews}
        />
        </div>
      </div>
    </Stage>
  );
}

function rankOf(score: number) {
  if (score >= 40000) return "Die scharfe Sibylle";
  if (score >= 30000) return "Parabellum-Gretel";
  if (score >= 22000) return "Parkbank-Legende";
  if (score >= 15000) return "Nadel-Scharfschützin";
  if (score >= 9000) return "Kleine Bella";
  if (score >= 4000) return "Strickliesel-Schützin";
  return "Wollknäuel-Werferin";
}

function ProfilePane(props: {
  loggedIn: boolean;
  profile: PlayerProfile;
  progPercent: number;
  progNeed: number;
  progIn: number;
  nextLv: number;
  profileInput: string;
  setProfileInput: (v: string) => void;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  authLoading: boolean;
  profileError: string | null;
  setProfileError: (v: string | null) => void;
  onAuth: () => void;
  onLogout: () => void;
  isSecured: boolean;
  claimPassword: string;
  setClaimPassword: (v: string) => void;
  claimError: string | null;
  setClaimError: (v: string | null) => void;
  onSecure: () => void;
  onStats: () => void;
  onPassword: () => void;
  chatMsgs: { name: string; text: string }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  chatRef: RefObject<HTMLDivElement | null>;
  onChat: (e: FormEvent) => void;
}) {
  const badge = getActiveBadgeIcon(props.profile.equipped);
  if (!props.loggedIn) {
    return (
      <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); props.onAuth(); }}>
        <p className="text-center text-sm font-black text-amber-100">Einloggen oder neu anlegen</p>
        <input maxLength={16} value={props.profileInput} onChange={(e) => { props.setProfileInput(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "")); props.setProfileError(null); }} placeholder="Name" className="h-11 rounded border border-amber-900 bg-black/50 px-3 text-sm text-white outline-none" />
        <input type="password" maxLength={32} value={props.passwordInput} onChange={(e) => { props.setPasswordInput(e.target.value); props.setProfileError(null); }} placeholder="Passwort" className="h-11 rounded border border-amber-900 bg-black/50 px-3 text-sm text-white outline-none" />
        <button type="submit" disabled={props.authLoading} className="h-12 rounded bg-amber-400 font-black text-black disabled:opacity-50">{props.authLoading ? "Prüfe…" : "Einloggen / Registrieren"}</button>
        {props.profileError && <p className="text-xs font-bold text-red-300">{props.profileError}</p>}
      </form>
    );
  }
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-lg font-black text-white">{badge ? `${badge} ` : ""}{props.profile.name}</p>
        <p className="text-xs font-bold text-amber-200">{rankOf(props.profile.highScore || 0)}</p>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-[11px] text-amber-100">
          <span>Nächstes Level {props.nextLv}</span>
          <span>{props.progIn}/{props.progNeed} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-black/60">
          <div className="h-full bg-amber-400" style={{ width: `${props.progPercent}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded bg-black/40 px-2 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-200/80">Runden</p>
          <p className="text-lg font-black text-white">{props.profile.gamesPlayed || 0}</p>
        </div>
        <div className="rounded bg-black/40 px-2 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-200/80">Treffer</p>
          <p className="text-lg font-black text-white">{props.profile.totalHits || 0}</p>
        </div>
        <div className="rounded bg-black/40 px-2 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-200/80">Rekord</p>
          <p className="text-lg font-black text-amber-200">{props.profile.highScore || 0}</p>
        </div>
        <div className="rounded bg-black/40 px-2 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-200/80">Groschen</p>
          <p className="text-lg font-black text-amber-100">🪙 {props.profile.coins || 0}</p>
        </div>
      </div>
      <div className="flex justify-center gap-4 text-xs font-bold">
        <button type="button" onClick={props.onPassword} className="text-amber-200 underline">Passwort</button>
        <button type="button" onClick={props.onLogout} className="text-red-300 underline">Abmelden</button>
      </div>
      {!props.isSecured && (
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-amber-300">Account noch ohne Passwort sichern</p>
          <div className="flex gap-2">
            <input type="password" value={props.claimPassword} onChange={(e) => { props.setClaimPassword(e.target.value); props.setClaimError(null); }} placeholder="Passwort" className="h-11 flex-1 rounded border border-amber-900 bg-black/50 px-2 text-sm text-white" />
            <button type="button" onClick={props.onSecure} className="h-11 rounded bg-amber-400 px-3 text-xs font-black text-black">Sichern</button>
          </div>
          {props.claimError && <p className="text-[11px] text-red-300">{props.claimError}</p>}
        </div>
      )}
      <div>
        <p className="mb-1 text-[11px] font-bold tracking-wide text-amber-200/80">Parkbank-Chat</p>
        <div ref={props.chatRef} className="max-h-24 space-y-1 overflow-y-auto rounded bg-black/35 p-2 text-xs">
          {props.chatMsgs.length === 0 ? <p className="text-amber-100/60">Noch keine Nachrichten.</p> : props.chatMsgs.map((m, i) => (
            <p key={i}><span className={m.name === props.profile.name ? "font-black text-amber-300" : "font-bold text-amber-100/70"}>{m.name}: </span>{m.text}</p>
          ))}
        </div>
        <form className="mt-2 flex gap-2" onSubmit={props.onChat}>
          <input maxLength={100} value={props.chatInput} onChange={(e) => props.setChatInput(e.target.value)} placeholder="Nachricht" className="h-10 flex-1 rounded border border-amber-900 bg-black/50 px-2 text-sm text-white" />
          <button type="submit" className="h-10 rounded bg-amber-400 px-3 text-xs font-black text-black">Senden</button>
        </form>
      </div>
    </div>
  );
}

function BoardList({ board, tab, me, onInspect }: { board: ScoreEntry[]; tab: "highscore" | "xp"; me: string; onInspect: (row: ScoreEntry) => void }) {
  const rows = board.slice(0, 100);
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-amber-100/70">Lade Top 100…</p>;
  return (
    <ol className="space-y-1">
      {rows.map((row, i) => {
        const isMe = Boolean(me && row.name.trim().toLowerCase() === me.trim().toLowerCase());
        const xp = row.totalXp || (row as { total_xp?: number }).total_xp || 0;
        return (
          <li key={`${row.name}-${i}`}>
            <button type="button" onClick={() => onInspect(row)} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${isMe ? "bg-amber-400/25 ring-2 ring-amber-300" : "bg-black/25"}`}>
              <span className="flex min-w-0 items-center gap-1.5 text-white">
                <span className="w-7 font-mono font-black">{i + 1}.</span>
                <span className="truncate font-bold">{row.name}</span>
                <span className="shrink-0 rounded bg-black/40 px-1 text-[10px] font-black text-amber-200">Lv.{getPlayerLevel(xp || row.score)}</span>
                {isMe && <span className="rounded bg-amber-400 px-1 text-[9px] font-black text-black">DU</span>}
              </span>
              <span className="shrink-0 font-mono font-black text-amber-200">{tab === "xp" ? `${xp || row.score} XP` : `${row.score} Pkt`}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
