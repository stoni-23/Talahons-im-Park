import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { emptyHud, GameEngine } from "@/game/engine";
import { unlockAudio } from "@/game/audio";
import { loadBoard, qualifies, submitScore, type ScoreEntry } from "@/game/scores";
import type { Hud } from "@/game/types";

const primaryBtn =
  "h-12 rounded-md bg-paper px-6 font-display text-2xl tracking-wide text-ink transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]";
const ghostBtn =
  "h-11 rounded-md border border-line px-6 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-3 hover:text-paper";

export function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [hud, setHud] = useState<Hud>(emptyHud());
  const [omaLine, setOmaLine] = useState(false);
  const [board, setBoard] = useState<ScoreEntry[]>(() => loadBoard());
  const [name, setName] = useState("");
  const [named, setNamed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas, setHud);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hud.mode !== "playing") {
      setOmaLine(false);
      return;
    }
    setOmaLine(true);
    const t = window.setTimeout(() => setOmaLine(false), 7000);
    return () => window.clearTimeout(t);
  }, [hud.mode]);

  useEffect(() => {
    if (hud.mode === "results") {
      setNamed(!qualifies(hud.score));
      setName("");
      setBoard(loadBoard());
    }
    if (hud.mode === "title") setBoard(loadBoard());
  }, [hud.mode, hud.score]);

  const engine = engineRef.current;
  const playing = hud.mode === "playing";
  const accuracy = hud.shots ? Math.round((hud.hits / hud.shots) * 100) : 0;
  const min = Math.floor(hud.timeLeft / 60);
  const sec = String(Math.floor(hud.timeLeft % 60)).padStart(2, "0");

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-ink text-paper">
      <div
        className="relative flex h-full w-full max-h-[100dvh] max-w-[100vw] items-center justify-center"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="block max-h-full max-w-full"
          style={{ cursor: playing ? "none" : "default", touchAction: "none" }}
        />

        {hud.mode === "title" && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/80 px-4 py-8">
            <div className="flex max-h-full w-full max-w-lg flex-col items-center gap-5 overflow-y-auto">
              <img
                src="/assets/logo.png"
                alt="Bankgeheimnis im Park"
                className="h-auto w-[min(72vw,280px)] select-none"
                draggable={false}
              />
              <p className="max-w-sm text-center text-xs italic leading-relaxed text-paper-dim">
                „Ich rede von meiner kleinen Parabellum-Halbautomatik, Kaliber 9 mm, mit erweitertem Magazin unter meinem Strickzeug. Die macht euch Beine, noch bevor ihr überhaupt ‚Guli Guli Ram Sam Sam‘ singen könnt …“
              </p>
              <ul className="w-full max-w-sm space-y-1.5 text-xs sm:text-sm text-paper-dim">
                <ScoreRow label="Wallah, kopfschuss!" value="2× Pkt + 50" />
                <ScoreRow label="Bahndidos auf dem Roller" value="200 Pkt" />
                <ScoreRow label="Hinterm Baum / im Busch" value="18–32 Pkt" />
                <ScoreRow label="Talahons im Park" value="8–35 Pkt" />
                <ScoreRow label="Fehlschuss ins Leere" value="-15 Pkt" />
              </ul>
              {board.length > 0 && (
                <ol className="w-full max-w-sm space-y-1 text-sm text-paper-dim">
                  {board.slice(0, 5).map((row, i) => (
                    <li key={`${row.at}-${row.name}`} className="flex justify-between gap-3">
                      <span className="truncate">
                        {i + 1}. {row.name}
                      </span>
                      <span className="font-medium tabular-nums text-paper">{row.score}</span>
                    </li>
                  ))}
                </ol>
              )}
              {hud.highScore > 0 && board.length === 0 && (
                <p className="font-display text-2xl tracking-wide text-paper">
                  Highscore {hud.highScore}
                </p>
              )}
              <button
                type="button"
                disabled={!hud.ready}
                onClick={() => {
                  unlockAudio();
                  engine?.start();
                }}
                className="h-12 min-w-44 rounded-lg bg-paper px-8 font-display text-2xl tracking-wide text-ink transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {hud.ready ? "Spielen" : "Laden…"}
              </button>
              <p className="text-xs text-muted">
                Klicken zum Zielen · Esc Pause · M Stumm
              </p>
            </div>
          </div>
        )}

        {(hud.mode === "playing" || hud.mode === "paused") && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-5">
              <HudChip label="Punkte" value={String(hud.score)} />
              <HudChip label="Zeit" value={`${min}:${sec}`} large />
              <HudChip label="Combo" value={String(hud.combo)} />
            </div>
            <div className="absolute right-3 bottom-[max(12px,env(safe-area-inset-bottom))] flex gap-2 sm:right-5">
              <IconBtn
                label={hud.muted ? "Ton an" : "Stumm"}
                onClick={() => engine?.toggleMute()}
              >
                {hud.muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </IconBtn>
              <IconBtn
                label={hud.mode === "paused" ? "Weiter" : "Pause"}
                onClick={() => (hud.mode === "paused" ? engine?.resume() : engine?.pause())}
              >
                {hud.mode === "paused" ? (
                  <Play className="size-5" />
                ) : (
                  <Pause className="size-5" />
                )}
              </IconBtn>
            </div>
            {omaLine && playing && (
              <div className="pointer-events-none absolute bottom-[max(4.75rem,calc(env(safe-area-inset-bottom)+3.5rem))] left-3 max-w-[min(78vw,22rem)] sm:bottom-10 sm:left-5">
                <div className="rounded-2xl rounded-bl-sm border border-line bg-ink/80 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">
                    Oma
                  </p>
                  <p className="mt-1 text-sm leading-snug text-paper sm:text-base">
                    „Die letzte, die unvorsichtig in meine Stricknadeln gegriffen hat,
                    strickt jetzt mit der Nase.“
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {hud.mode === "paused" && (
          <Modal>
            <p className="font-display text-5xl tracking-wide">Pause</p>
            <div className="mt-6 flex flex-col gap-2">
              <button type="button" className={primaryBtn} onClick={() => engine?.resume()}>
                Weiter
              </button>
              <button type="button" className={ghostBtn} onClick={() => engine?.toTitle()}>
                Menü
              </button>
            </div>
          </Modal>
        )}

        {hud.mode === "results" && (
          <Modal>
            <p className="font-display text-5xl tracking-wide">Runde vorbei</p>
            {hud.isNewHigh && (
              <p className="mt-2 text-sm font-medium text-paper">Neuer Highscore</p>
            )}
            <p className="mt-4 font-display text-6xl tabular-nums tracking-wide">{hud.score}</p>
            <dl className="mt-5 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-2 text-sm text-paper-dim">
              <dt>Treffer</dt>
              <dd className="text-right tabular-nums text-paper">
                {hud.hits} / {hud.shots}
              </dd>
              <dt>Genauigkeit</dt>
              <dd className="text-right tabular-nums text-paper">{accuracy}%</dd>
              <dt>Beste Combo</dt>
              <dd className="text-right tabular-nums text-paper">{hud.bestCombo}</dd>
              <dt>Highscore</dt>
              <dd className="text-right tabular-nums text-paper">
                {Math.max(hud.highScore, board[0]?.score ?? 0)}
              </dd>
            </dl>
            {!named && qualifies(hud.score) ? (
              <form
                className="mt-5 flex w-full max-w-xs flex-col gap-2"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  setBoard(submitScore(name, hud.score));
                  setNamed(true);
                }}
              >
                <label className="text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">
                  Name für die Bestenliste
                </label>
                <input
                  autoFocus
                  maxLength={16}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                  className="h-11 rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-muted"
                />
                <button type="submit" className={primaryBtn}>
                  Eintragen
                </button>
              </form>
            ) : (
              board.length > 0 && (
                <ol className="mt-5 w-full max-w-xs space-y-1 text-sm text-paper-dim">
                  {board.map((row, i) => (
                    <li
                      key={`${row.at}-${row.name}`}
                      className={`flex justify-between gap-3 ${row.score === hud.score && row.name === (name.trim() || "Anonym") ? "text-paper" : ""}`}
                    >
                      <span className="truncate">
                        {i + 1}. {row.name}
                      </span>
                      <span className="tabular-nums text-paper">{row.score}</span>
                    </li>
                  ))}
                </ol>
              )
            )}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                className={primaryBtn}
                onClick={() => {
                  if (!named && qualifies(hud.score)) submitScore(name, hud.score);
                  unlockAudio();
                  engine?.start();
                }}
              >
                Nochmal
              </button>
              <button
                type="button"
                className={ghostBtn}
                onClick={() => {
                  if (!named && qualifies(hud.score)) submitScore(name, hud.score);
                  engine?.toTitle();
                }}
              >
                Menü
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-4 border-b border-line py-1">
      <span>{label}</span>
      <span className="font-medium text-paper">{value}</span>
    </li>
  );
}

function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/70 px-4">
      <div className="max-h-[min(92dvh,44rem)] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-ink-2 px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        {children}
      </div>
    </div>
  );
}

function HudChip({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="pointer-events-none rounded-md border border-line bg-ink/55 px-3 py-2 backdrop-blur-sm">
      <div className="text-[10px] font-medium tracking-[0.14em] text-paper-dim uppercase">
        {label}
      </div>
      <div
        className={`font-display tabular-nums tracking-wide ${large ? "text-4xl" : "text-3xl"}`}
      >
        {value}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-md border border-line bg-ink/70 text-paper backdrop-blur-sm transition-colors hover:bg-ink-3"
    >
      {children}
    </button>
  );
}
