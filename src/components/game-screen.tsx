function getOmaRank(score: number) {
  if (score >= 40000) return { title: "👑 Die scharfe Sibylle", desc: "Endgegnerin: Meisterin der Parabellum, absolute Herrscherin über den Park.", color: "text-amber-400 border-amber-500/50 bg-amber-950/40" };
  if (score >= 30000) return { title: "💥 Parabellum-Gretel", desc: "Schneller am Abzug als jede Kappe fliegen kann.", color: "text-red-400 border-red-500/50 bg-red-950/40" };
  if (score >= 22000) return { title: "🪑 Parkbank-Legende", desc: "Hält Hof auf der Bank – kein Schattenboxer kommt vorbei.", color: "text-purple-400 border-purple-500/50 bg-purple-950/40" };
  if (score >= 15000) return { title: "🎯 Nadel-Scharfschützin", desc: "Jeder Schuss sitzt präzise wie eine rechte Masche.", color: "text-blue-400 border-blue-500/50 bg-blue-950/40" };
  if (score >= 9000) return { title: "⚡ Kleine Bella", desc: "Flink, treffsicher und räumt die E-Scooter vom Gehweg ab.", color: "text-emerald-400 border-emerald-500/50 bg-emerald-950/40" };
  if (score >= 4000) return { title: "🪡 Strickliesel-Schützin", desc: "Erste Maschen sitzen – die Fake-Caps fliegen im hohen Bogen.", color: "text-yellow-300 border-yellow-500/40 bg-yellow-950/30" };
  return { title: "🧶 Wollknäuel-Werferin", desc: "Verheddert sich noch in den Maschen, trifft höchstens die Parkbank.", color: "text-stone-300 border-stone-600 bg-stone-900/40" };
}

import React, { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { emptyHud, GameEngine } from "@/game/engine";
import { unlockAudio } from "@/game/audio";
import { qualifies, loadBoard, submitScore, fetchOnlineBoard, type ScoreEntry } from "@/game/scores";
import type { Hud } from "@/game/types";

const primaryBtn =
  "h-12 rounded-md bg-paper px-6 font-display text-2xl tracking-wide text-ink transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]";
const ghostBtn =
  "h-11 rounded-md border border-line px-6 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-3 hover:text-paper";

export function GameScreen() {
  const [showAllScores, setShowAllScores] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [hud, setHud] = useState<Hud>(emptyHud());
  const [omaLine, setOmaLine] = useState(false);
  const [board, setBoard] = useState<ScoreEntry[]>([]);
  const [name, setName] = useState("");
  const [named, setNamed] = useState(false);

  useEffect(() => {
    fetchOnlineBoard().then((data) => {
      if (data && data.length > 0) setBoard(data);
    });
  }, [hud.mode]);

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
      fetchOnlineBoard().then((data) => {
        if (data && data.length > 0) setBoard(data);
      });
    }
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
            <div className="flex max-h-full w-full max-w-lg flex-col items-center gap-4 overflow-y-auto">
              <img
                src="/assets/logo.png?v=2"
                alt="Bankgeheimnis im Park"
                className="h-auto w-[min(55vw,170px)] select-none"
                draggable={false}
              />
              <p className="max-w-sm text-center text-xs italic leading-relaxed text-paper-dim">
                „Ich rede von meiner kleinen Parabellum-Halbautomatik, Kaliber 9 mm, mit erweitertem Magazin unter meinem Strickzeug. Die macht euch Beine, noch bevor ihr überhaupt ‚Guli Guli Ram Sam Sam‘ singen könnt …“
              </p>

              {/* Weltweite Top 10 */}
              <button
                type="button"
                disabled={!hud.ready}
                onClick={() => {
                  unlockAudio();
                  engine?.start();
                }}
                className={primaryBtn}
              >
                {hud.ready ? "🎮 JETZT SPIELEN" : "Laden…"}
              </button>

              {/* Highscore Liste (Top 5 / Top 100) */}
              <div className="w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold tracking-[0.14em] text-paper uppercase">
                    🏆 {showAllScores ? "Top 100 Rangliste" : "Top 5 Bestenliste"}
                  </p>
                  {board.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllScores(!showAllScores)}
                      className="text-[11px] font-semibold text-amber-400 underline hover:text-amber-300"
                    >
                      {showAllScores ? "Top 5" : "Alle 100"}
                    </button>
                  )}
                </div>
                {board.length > 0 ? (
                  <ol className={`divide-y divide-line/40 text-xs text-paper-dim ${showAllScores ? "max-h-60 overflow-y-auto pr-1" : ""}`}>
                    {board.slice(0, showAllScores ? 100 : 5).map((row, i) => (
                      <li key={`${row.name}-${i}-${row.score}`} className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 truncate">
                          <span className="w-5 font-mono font-semibold text-paper">{i + 1}.</span>
                          <span className="truncate text-paper">{row.name}</span>
                        </span>
                        <span className="font-mono font-bold text-amber-400">{row.score} Pkt</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-2 text-center text-xs text-muted">Lade Rangliste…</p>
                )}
              </div>

              {/* Spielanleitung & Punktetabelle */}
              <ul className="w-full max-w-sm space-y-1 rounded-xl border border-line bg-ink/60 p-3 text-xs text-paper-dim">
                <ScoreRow label="⚡ Stricknadelkommando (5er Combo)" value="5s Dauerfeuer (0 Fehl-Abzug)" />
                <ScoreRow label="Wallah, kopfschuss!" value="2× Pkt + 50" />
                <ScoreRow label="Bahndidos auf dem Roller" value="200 Pkt" />
                <ScoreRow label="✨ Talahin auf fliegendem Teppich" value="150 Pkt" />
                <ScoreRow label="Hinterm Baum / im Busch" value="18–32 Pkt" />
                <ScoreRow label="Talahons im Park" value="8–35 Pkt" />
                <ScoreRow label="Opa Spaziergänger (Vorsicht!)" value="-50 Pkt" />
                <ScoreRow label="Fehlschuss ins Leere" value="-15 Pkt" />
              </ul>

              <p className="text-[11px] text-muted">
                Klicken/Tippen zum Zielen · Im Kommando gedrückt halten · Esc Pause
              </p>
            </div>
          </div>
        )}

        {(hud.mode === "playing" || hud.mode === "paused") && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-5">
              <HudChip label="Punkte" value={String(hud.score)} />
              <HudChip label="Zeit" value={`${min}:${sec}`} large urgent={hud.timeLeft <= 10 && playing} />
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
            <p className="font-display text-4xl tracking-wide">Runde vorbei</p>
            <p className="mt-2 font-display text-5xl tabular-nums tracking-wide text-amber-400">{hud.score} Pkt</p>
            <dl className="mt-4 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:text-sm text-paper-dim">
              <dt>Treffer</dt>
              <dd className="text-right tabular-nums text-paper">{hud.hits} / {hud.shots}</dd>
              <dt>Genauigkeit</dt>
              <dd className="text-right tabular-nums text-paper">{accuracy}%</dd>
              <dt>Beste Combo</dt>
              <dd className="text-right tabular-nums text-paper">{hud.bestCombo}</dd>
            </dl>

            {/* Rang-Auszeichnung */}
            {(() => {
              const rank = getOmaRank(hud.score);
              return (
                <div className={`mt-3 w-full max-w-xs rounded-xl border p-3 text-center ${rank.color}`}>
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-80">Dein erreichter Rang</p>
                  <p className="mt-0.5 text-base font-black tracking-wide">{rank.title}</p>
                  <p className="mt-1 text-xs leading-snug opacity-90">{rank.desc}</p>
                </div>
              );
            })()}

            {!named ? (
              <form
                className="mt-4 flex w-full max-w-xs flex-col gap-2"
                onSubmit={async (e: FormEvent) => {
                  e.preventDefault();
                  if (!name.trim()) return;
                  setNamed(true);
                  const updated = await submitScore(name, hud.score);
                  setBoard(updated);
                }}
              >
                <label className="text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">
                  Name für die 🏆 Bestenliste
                </label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    maxLength={16}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dein Name"
                    className="h-11 flex-1 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-muted"
                  />
                  <button type="submit" className="h-11 rounded-md bg-paper px-4 font-semibold text-sm text-ink">
                    Speichern
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 w-full max-w-xs rounded-xl border border-line bg-ink/90 p-3">
                <p className="mb-2 text-center text-xs font-bold tracking-[0.14em] text-paper uppercase">
                  🏆 Parkbank Top 10
                </p>
                <ol className="divide-y divide-line/40 text-xs text-paper-dim max-h-36 overflow-y-auto">
                  {board.slice(0, 10).map((row, i) => (
                    <li key={`${row.name}-${i}-${row.score}`} className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-2 truncate">
                        <span className="w-5 font-mono font-semibold text-paper">{i + 1}.</span>
                        <span className="truncate text-paper">{row.name}</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400">{row.score} Pkt</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
              <button
                type="button"
                className={primaryBtn}
                onClick={() => {
                  setNamed(false);
                  setName("");
                  engine?.start();
                }}
              >
                Nochmal spielen
              </button>
              <button
                type="button"
                className={ghostBtn}
                onClick={() => {
                  setNamed(false);
                  setName("");
                  engine?.toTitle();
                }}
              >
                Zum Menü
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

function HudChip({ label, value, large, urgent }: { label: string; value: string; large?: boolean; urgent?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-lg border px-3 py-1.5 backdrop-blur-sm transition-colors ${urgent ? "border-red-500/80 bg-red-950/60" : "border-line bg-ink/70"}`}>
      <span className={`text-[10px] font-medium tracking-[0.14em] uppercase ${urgent ? "text-red-400" : "text-paper-dim"}`}>{label}</span>
      <span className={`font-display tabular-nums ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"} ${urgent ? "text-red-500 animate-pulse font-bold" : "text-paper"}`}>
        {value}
      </span>
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-line bg-ink/70 text-paper backdrop-blur-sm transition-transform active:scale-95"
    >
      {children}
    </button>
  );
}

function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/80 p-4">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-line bg-ink p-6 text-center shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium text-paper">{value}</span>
    </li>
  );
}
