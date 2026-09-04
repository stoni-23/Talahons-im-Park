import {
  onGameStartAudio,
  playOpaSpawn,
  playOpaHit,
  playTalahonHitVoice,
  playOmaHitVoice,
  cancelOmaSpeech,
  isMuted,
  playHit,
  playMiss,
  playOmaLine, playOmaKommando, stopOmaKommando,
  playRocker,
  playRoundEnd,
  playShot,
  preloadSounds,
  resumeAudio,
  setMuted,
  setParkPaused,
  startParkAmbience,
  stopParkAmbience,
  tickChirps,
  unlockAudio,
} from "./audio";
import { topScore } from "./scores";
import type { Flash, Floater, Hole, Hud, Particle, Target } from "./types";

export const WORLD_W = 900;
export const WORLD_H = 1600;
const FIRE_CD = 0.26;
const COMBO_WINDOW = 1.05;
const MAX_ALIVE = 9;
const OMA_KEEP_X = -300;
const OPA_HIT_HOLD = 1.05;

const LANES = [
  { y: 960, scale: 0.54, z: 0.20, pts: 35, speed: 45 },
  { y: 1060, scale: 0.72, z: 0.50, pts: 22, speed: 65 },
  { y: 1160, scale: 0.92, z: 0.70, pts: 14, speed: 90 },
  { y: 1290, scale: 1.15, z: 0.95, pts: 8, speed: 118 },
];

const TREES = [
  { x: 440, y: 980, z: 0.14, trunkW: 45, scale: 0.48, facing: -1 },
  { x: 460, y: 980, z: 0.14, trunkW: 45, scale: 0.48, facing: 1 }
];

const BUSHES = [
  { x: 90, y: 920, z: 0.12, scale: 0.46, w: 60, h: 38, facing: 1 },
  { x: 810, y: 920, z: 0.12, scale: 0.46, w: 60, h: 38, facing: -1 }
];

const ASSET_KEYS = [
  "park-bg",
  "tree",
  "foliage",
  "oma",
  "oma-recoil",
  "bahndidos",
  "tonne-zu",
  "tonne-hippie",
  "tonne-umgekippt",
  "talahin_1",
  "talahin_2",
  "logo",
  "opa_walk",
  "opa_hit",
  ...[1, 2, 3, 4].flatMap((n) => [
    `talahon-walk-${n}`,
    `talahon-walk-b-${n}`,
    `talahon-run-${n}`,
    `talahon-hit-${n}`,
    `muzzle-${n}`,
    `impact-${n}`,
  ]),
];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pick<T>(arr: T[]) {
  return arr[(Math.random() * arr.length) | 0]!;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export type PlayerProfile = {
  name: string;
  highScore: number;
  gamesPlayed: number;
  totalHits: number;
};

const PROFILE_KEY = "bankgeheimnis_profile";

function defaultProfile(): PlayerProfile {
  return { name: "", highScore: 0, gamesPlayed: 0, totalHits: 0 };
}

function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const p = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      name: typeof p.name === "string" ? p.name.trim().slice(0, 24) : "",
      highScore: typeof p.highScore === "number" ? Math.max(0, p.highScore) : 0,
      gamesPlayed: typeof p.gamesPlayed === "number" ? Math.max(0, p.gamesPlayed) : 0,
      totalHits: typeof p.totalHits === "number" ? Math.max(0, p.totalHits) : 0,
    };
  } catch {
    return defaultProfile();
  }
}

function saveProfile(p: PlayerProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* private mode / blocked storage */
  }
}

async function submitHighscore(name: string, score: number, highScore: number) {
  const payload = { name, score, highScore };
  for (const url of ["/api/score", "/api/scores"]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return;
    } catch {
      /* route may not exist in local dev */
    }
  }
}

function emptyHud(): Hud {
  return {
    mode: "title",
    score: 0,
    timeLeft: 90,
    combo: 0,
    shots: 0,
    hits: 0,
    highScore: 0,
    isNewHigh: false,
    bestCombo: 0,
    muted: false,
    ready: false,
    playerName: "",
    gamesPlayed: 0,
    totalHits: 0,
  } as Hud;
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  images = new Map<string, HTMLImageElement>();
  mode: Hud["mode"] = "title";
  ready = false;
  score = 0;
  timeLeft = 90;
  combo = 0;
  comboT = 0;
  strickT = 0;
  shots = 0;
  hits = 0;
  bestCombo = 0;
  highScore = 0;
  isNewHigh = false;
  fireCd = 0;
  recoil = 0;
  trauma = 0;
  hitstop = 0;
  aimX = WORLD_W / 2;
  aimY = 450;
  targets: Target[] = [];
  particles: Particle[] = [];
  floaters: Floater[] = [];
  holes: Hole[] = [];
  flashes: Flash[] = [];
  spawnAcc = 0;
  hippieT = 25;
  hippieCount = 0;
  rockerT = 12;
  carpetT = 18;
  opaT = 8;
  hudAcc = 0;
  id = 1;
  last = 0;
  raf = 0;
  reduced = false;
  lowPower = false;
  slowFrames = 0;
  fpsAcc = 0;
  fpsFrames = 0;
  onHud: (hud: Hud) => void;
  destroyed = false;
  pointerDown = false;
  peekBusy = new Set<number>();
  bushBusy = new Set<number>();
  profile: PlayerProfile = defaultProfile();

  constructor(canvas: HTMLCanvasElement, onHud: (hud: Hud) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) ?? canvas.getContext("2d")!;
    this.onHud = onHud;
    this.profile = loadProfile();
    this.highScore = Math.max(topScore(), this.profile.highScore);
    this.profile.highScore = this.highScore;
    saveProfile(this.profile);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lowPower = this.detectLowPower();
    this.bind();
    this.resize();
    void this.boot();
  }

  hud(): Hud {
    return {
      mode: this.mode,
      score: this.score,
      timeLeft: this.timeLeft,
      combo: this.combo,
      shots: this.shots,
      hits: this.hits,
      highScore: this.highScore,
      isNewHigh: this.isNewHigh,
      bestCombo: this.bestCombo,
      muted: isMuted(),
      ready: this.ready,
      playerName: this.profile.name,
      gamesPlayed: this.profile.gamesPlayed,
      totalHits: this.profile.totalHits,
    } as Hud;
  }

  emit() {
    this.onHud(this.hud());
  }

  detectLowPower() {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const mem = nav.deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency || 8;
    const weakMem = mem <= 3;
    const weakCpu = cores <= 4 && mem <= 4;
    return this.reduced || weakMem || weakCpu;
  }

  setLowPower(on: boolean) {
    if (this.lowPower === on) return;
    this.lowPower = on;
    this.resize();
  }

  async boot() {
    await Promise.all(
      ASSET_KEYS.map(async (key) => {
        try {
          let img: HTMLImageElement;
          try {
            img = await loadImage(`/assets/${key}.${key === "park-bg" ? "jpg" : "png"}`);
          } catch {
            img = await loadImage(`/${key}.${key === "park-bg" ? "jpg" : "png"}`);
          }
          this.images.set(key, img);
        } catch {
          /* keep going so one missing file doesn't blank the round */
        }
      }),
    );
    await preloadSounds();
    this.ready = true;
    this.emit();
    this.loop(performance.now());
  }

  img(key: string) {
    return this.images.get(key) ?? null;
  }

  private onResize = () => this.resize();
  private onPointerMove = (e: PointerEvent) => {
    const p = this.toLocal(e);
    this.aimX = p.x;
    this.aimY = p.y;
  };
  private onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    unlockAudio();
    const p = this.toLocal(e);
    this.aimX = p.x;
    this.aimY = p.y;
    this.pointerDown = true;
    if (this.mode === "playing") this.shoot();
  };
  private onPointerUp = () => {
    this.pointerDown = false;
  };
  private onKey = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      if (this.mode === "playing") this.pause();
      else if (this.mode === "paused") this.resume();
    }
    if (e.code === "KeyM") this.toggleMute();
    if (e.code === "Space" && this.mode === "title" && this.ready) {
      e.preventDefault();
      this.start();
    }
  };
  private onVis = () => {
    if (document.visibilityState === "visible") resumeAudio();
  };

  bind() {
    window.addEventListener("resize", this.onResize);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("keydown", this.onKey);
    document.addEventListener("visibilitychange", this.onVis);
  }

  toLocal(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * WORLD_W,
      y: ((e.clientY - r.top) / r.height) * WORLD_H,
    };
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const fit = Math.min(parent.clientWidth / WORLD_W, parent.clientHeight / WORLD_H);
    const w = Math.max(1, WORLD_W * fit);
    const h = Math.max(1, WORLD_H * fit);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    const raw = window.devicePixelRatio || 1;
    const cap = this.lowPower ? 1 : raw > 2.5 ? 1.25 : Math.min(1.5, raw);
    const dpr = Math.max(1, cap);
    const res = this.lowPower ? 0.72 : 1;
    this.canvas.width = Math.floor(WORLD_W * dpr * res);
    this.canvas.height = Math.floor(WORLD_H * dpr * res);
    this.ctx.setTransform(dpr * res, 0, 0, dpr * res, 0, 0);
  }

  aliveCount() {
    return this.targets.reduce((n, t) => n + +(t.state === "alive"), 0);
  }

  maxAlive() {
    return this.lowPower ? 6 : MAX_ALIVE;
  }

  ensureName() {
    if (this.profile.name) return;
    const entered = "";
    this.profile.name = entered || "Spieler";
    saveProfile(this.profile);
    this.emit();
  }

  start() {
    this.ensureName();
    unlockAudio();
    playOmaLine();
    startParkAmbience();
    onGameStartAudio();
    this.mode = "playing";
    if ("omaKommando" in this) (this as any).omaKommando = false;
    if ("frenzy" in this) (this as any).frenzy = false;
    if ("frenzyTimer" in this) (this as any).frenzyTimer = 0;
    if ("kommandoTimer" in this) (this as any).kommandoTimer = 0;
    if ("rapidTimer" in this) (this as any).rapidTimer = 0;
    if ("rapidFire" in this) (this as any).rapidFire = false;
    this.score = 0;
    this.timeLeft = 90;
    this.combo = 0;
    this.comboT = 0;
    this.shots = 0;
    this.hits = 0;
    this.bestCombo = 0;
    this.isNewHigh = false;
    this.fireCd = 0;
    this.recoil = 0;
    this.trauma = 0;
    this.strickT = 0;
    stopOmaKommando();
    this.targets = [];
    this.particles = [];
    this.floaters = [];
    this.holes = [];
    this.flashes = [];
    this.peekBusy.clear();
    this.bushBusy.clear();
    this.spawnAcc = 0.5;
    this.hippieT = 25; this.hippieCount = 0;
    this.rockerT = rand(8, 13);
    this.carpetT = rand(15, 22);
    this.opaT = rand(6, 10);
    this.spawnBush();
    this.spawnBush();
    this.spawnBush();
    this.spawnPeeker();
    this.spawnWalker(2, false);
    this.emit();
  }

  pause() {
    if (this.mode === "playing") {
      this.mode = "paused";
      setParkPaused(true);
      this.emit();
    }
  }

  resume() {
    if (this.mode === "paused") {
      this.mode = "playing";
      this.last = performance.now();
      setParkPaused(false);
      this.emit();
    }
  }

  toTitle() {
    this.strickT = 0;
    this.trauma = 0;
    this.recoil = 0;
    stopOmaKommando();
    cancelOmaSpeech();
    stopParkAmbience();
    this.mode = "title";
    this.targets = [];
    this.peekBusy.clear();
    this.bushBusy.clear();
    this.emit();
  }

  toggleMute() {
    setMuted(!isMuted());
    this.emit();
  }

  endRound() {
    cancelOmaSpeech();
    stopParkAmbience();
    playRoundEnd();
    this.mode = "results";
      this.strickT = 0;
      this.trauma = 0;
      this.recoil = 0;
      stopOmaKommando();
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewHigh = true;
    }
    this.profile.gamesPlayed += 1;
    this.profile.totalHits += this.hits;
    this.profile.highScore = Math.max(this.profile.highScore, this.highScore);
    if (!this.profile.name) this.profile.name = "Spieler";
    saveProfile(this.profile);
    void submitHighscore(this.profile.name, this.score, this.profile.highScore);
    this.emit();
  }

  baseTarget(): Omit<Target, "id" | "act" | "x" | "y" | "vx" | "z" | "facing" | "points" | "scale"> {
    return {
      variant: Math.random() < 0.5 ? "a" : "b",
      vy: 0,
      frame: 0,
      frameT: 0,
      state: "alive",
      phase: "move",
      phaseT: 0,
      reveal: 1,
      rot: 0,
      dw: 0,
      dh: 0,
      hide: -1,
    };
  }

  spawnWalker(lane?: number, running?: boolean, x?: number) {
    if (this.aliveCount() >= this.maxAlive()) return;
    const laneI =
      lane ??
      (Math.random() < 0.34 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.58 ? 2 : 3);
    const L = LANES[laneI]!;
    const run = running ?? Math.random() < 0.38;
    const fromRight = Math.random() < 0.5;
    const speed = L.speed * (run ? 2.2 : 1) * rand(0.88, 1.18);
    const start = x ?? (fromRight ? 1150 : -150);
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: run ? "run" : "walk",
      x: start,
      y: L.y,
      vx: (fromRight ? -1 : 1) * speed,
      z: L.z,
      facing: fromRight ? -1 : 1,
      points: run ? L.pts + 6 : L.pts,
      scale: L.scale,
      phase: "move",
    });
  }

  spawnPeeker() {
    if (this.aliveCount() >= this.maxAlive()) return;
    const free = TREES.map((_, i) => i).filter(
      (i) => !this.peekBusy.has(i) && TREES[i]!.x >= OMA_KEEP_X,
    );
    if (!free.length) return;
    const idx = pick(free);
    const tree = TREES[idx]!;
    this.peekBusy.add(idx);
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "peek",
      x: tree.x,
      y: tree.y,
      vx: 0,
      z: tree.z + 0.04,
      facing: tree.facing,
      points: tree.scale < 0.42 ? 32 : 26,
      scale: tree.scale,
      phase: "in",
      phaseT: 0,
      reveal: 0,
      hide: idx,
    });
  }

  spawnBush() {
    if (this.aliveCount() >= this.maxAlive()) return;
    const free = BUSHES.map((_, i) => i).filter(
      (i) => !this.bushBusy.has(i) && BUSHES[i]!.x >= OMA_KEEP_X,
    );
    if (!free.length) return;
    const idx = pick(free);
    const bush = BUSHES[idx]!;
    this.bushBusy.add(idx);
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "bush",
      x: bush.x + bush.facing * 10,
      y: bush.y,
      vx: 0,
      z: bush.z + 0.06,
      facing: bush.facing,
      points: bush.scale < 0.8 ? 22 : 16,
      scale: bush.scale,
      phase: "in",
      phaseT: 0,
      reveal: 0,
      hide: idx,
    });
  }

  spawnOpa() {
    playOpaSpawn();
    if (this.targets.some((t) => t.act === "opa")) return;
    const fromRight = Math.random() < 0.5;
    const speed = 65;
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "opa",
      x: fromRight ? 960 : -80,
      y: 1180,
      vx: (fromRight ? -1 : 1) * speed,
      z: 0.76,
      facing: fromRight ? -1 : 1,
      points: -50,
      scale: 0.92,
      phase: "move",
    });
  }

  spawnCarpet() {
    if (this.targets.some((t) => t.act === "carpet" && t.state === "alive")) return;
    import("./audio").then((a) => a.playTalahinIntro());
    const fromRight = Math.random() < 0.5;
    const speed = 190;
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "carpet",
      x: fromRight ? 980 : -120,
      y: 340,
      vx: (fromRight ? -1 : 1) * speed,
      vy: 0,
      z: 1.20,
      facing: fromRight ? -1 : 1,
      points: 150,
      scale: 0.82,
      phase: "move",
      phaseT: Math.random() * Math.PI * 2,
    });
  }

    spawnHippie() {
    if (this.targets.some((t) => t.act === "hippie" && t.state === "alive")) return;
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "hippie",
      x: rand(200, WORLD_W - 200),
      y: -120,
      vy: 1800,
      z: 0.40,
      scale: 0.9,
      openStart: rand(1.2, 4.0),
      openDur: rand(2.2, 3.2),
      standMax: rand(7.5, 9.5),
      points: 150,
      phase: "in",
    });
  }

  spawnRocker() {
    if (this.targets.some((t) => t.act === "rocker" && t.state === "alive")) return;
    import("./audio").then((a) => a.playRocker());
    const fromRight = Math.random() < 0.5;
    const speed = 260;
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "rocker",
      x: fromRight ? 960 : -80,
      y: 1190,
      vx: (fromRight ? -1 : 1) * speed,
      z: 0.78,
      facing: fromRight ? -1 : 1,
      points: 200,
      scale: 0.92,
      phase: "move",
    });
  }

  freeHide(t: Target) {
    if (t.act === "peek" && t.hide >= 0) this.peekBusy.delete(t.hide);
    if (t.act === "bush" && t.hide >= 0) this.bushBusy.delete(t.hide);
    t.hide = -1;
  }

  dashOut(t: Target, run = true) {
    let dir = t.facing;
    this.freeHide(t);
    t.act = run ? "run" : "walk";
    t.phase = "move";
    t.phaseT = 0;
    t.reveal = 1;
    t.facing = dir;
    t.vx = dir * ((run ? 210 : 92) * (0.55 + t.scale));
    t.points = run ? t.points + 4 : Math.max(8, t.points - 6);
  }

  placeBush(t: Target) {
    if (t.hide < 0) return;
    const bush = BUSHES[t.hide]!;
    const dh = t.dh || 335 * t.scale;
    const shown = clamp(t.reveal, 0.12, 0.72);
    t.y = bush.y - bush.h + 18 + dh * (1 - shown);
  }

  hitTest(t: Target, x: number, y: number): boolean {
    const dw = t.dw || 140 * t.scale;
    const dh = t.dh || 335 * t.scale;
    const left = t.x - dw * 0.5;
    const right = t.x + dw * 0.5;
    const top = t.y - dh;
    const bottom = t.y;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  shoot() {
    if (this.mode !== "playing" || this.fireCd > 0) return;
    this.fireCd = this.strickT > 0 ? 0.06 : FIRE_CD;
    this.recoil = 0.12;
    this.shots++;
    playShot();
    if (!this.reduced) {
      this.trauma = Math.min(1, this.trauma + (this.strickT > 0 ? 0.55 : 0.32));
    }
    const oma = this.omaRect();
    if (!this.lowPower) this.flashes.push({ x: oma.mx, y: oma.my, t: 0.12, kind: "muzzle" });
    let hit: Target | null = null;
    let z = -1;
    let dist = Infinity;
    for (const t of this.targets) {
      if (
        t.state !== "alive" ||
        (t.act === "bush" && t.reveal < 0.2) ||
        (t.act === "peek" && t.reveal < 0.18) ||
        (t.act === "peek" && t.phase === "out") ||
        !this.hitTest(t, this.aimX, this.aimY)
      )
        continue;
      const cx = t.x;
      const cy = t.y - t.dh * 0.45;
      const d = (cx - this.aimX) ** 2 + (cy - this.aimY) ** 2;
      if (t.z > z + 0.01 || (Math.abs(t.z - z) < 0.01 && d < dist)) {
        hit = t;
        z = t.z;
        dist = d;
      }
    }
    if (hit) {
      const isHead = this.aimY <= (hit.y - (hit.dh || 80) * 0.62);
      this.kill(hit, isHead);
    } else {
      playMiss();
      if (this.strickT <= 0) {
        this.combo = 0;
        this.score = Math.max(0, this.score - 15);
        this.floaters.push({
          x: this.aimX,
          y: this.aimY,
          text: "-15",
          color: "#ff4d4d",
          life: 0.8,
          max: 0.8,
          vy: -40,
        });
      }
    }
  }

  kill(t: Target, isHeadshot = false) {
    if (t.state !== "alive") return;

    if (t.act === "hippie") {
      const oS = (t as any).openStart || 2.0;
      const oE = oS + ((t as any).openDur || 2.5);
      const isOpen = t.phase === "hold" && t.phaseT >= oS && t.phaseT < oE;
      if (!isOpen) {
        this.score = Math.max(0, this.score - 50);
        this.combo = 0;
        this.floaters.push({
          x: t.x,
          y: t.y - 120,
          text: "Deckel zu! (-50)",
          life: 1.0,
          max: 1.0,
          color: "#ef4444"
        });
        this.burst(t.x, t.y - 60, 6, "#94a3b8", 80);
        return;
      }
    }

    if (t.act === "opa") {
      t.state = "falling";
      t.rot = 0;
      t.frame = 0;
      t.frameT = 0;
      t.phase = "hit";
      t.phaseT = 0;
      t.vx = 0;
      t.vy = 0;
      t.facing = 1;
      this.hits++;
      this.combo = 0;
      this.score = Math.max(0, this.score - 50);
      this.floaters.push({
        x: t.x,
        y: t.y - (t.dh || 80) * 0.95,
        text: "Finger weg! (-50)",
        life: 1.15,
        max: 1.15,
        color: "#ef4444",
      });
      return;
    }

    t.state = "falling";
    t.rot = 0;
    t.frame = 0;
    t.frameT = 0;
    t.vy = -180;
    t.vx = (this.aimX > t.x ? -1 : 1) * 90;
    this.freeHide(t);
    this.hits++;

    this.combo += 1;
    const mult = Math.min(5, 1 + Math.floor((this.combo - 1) / 3));
    if (mult >= 5 && this.strickT <= 0) {
      this.strickT = 5.0;
      playOmaKommando();
    }
    this.comboT = COMBO_WINDOW;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    let pts = Math.round(t.points * (1 + Math.min(this.combo, 10) * 0.15));

    if (isHeadshot) {
      pts = Math.round(pts * 2 + 50);
      this.floaters.push({
        x: t.x,
        y: t.y - (t.dh || 80) - 20,
        text: "Wallah, kopfschuss!",
        color: "#ffcc00",
        life: 1.2,
        max: 1.2,
        vy: -60,
      });
    } else {
      let streakText = "";
      let streakColor = "#ffffff";
      if (this.combo >= 5) {
        streakText = "PARK-LEGENDE!";
        streakColor = "#ffcc00";
      } else if (this.combo >= 3) {
        streakText = "Voll rasiert!";
        streakColor = "#00ffcc";
      } else if (this.combo >= 2) {
        streakText = "Macher!";
        streakColor = "#ffffff";
      }
      if (streakText) {
        this.floaters.push({
          x: t.x,
          y: t.y - (t.dh || 80) * 0.6,
          text: streakText,
          color: streakColor,
          life: 0.9,
          max: 0.9,
          vy: -45,
        });
      }
    }

    this.score += pts;
    playHit(this.combo);
    if (t.act === "oma") {
      playOmaHitVoice();
    } else {
      playTalahonHitVoice();
    }

    if (!this.reduced && !this.lowPower) {
      this.trauma = Math.min(1, this.trauma + (t.act === "rocker" ? 0.7 : 0.38));
      this.hitstop = t.act === "rocker" ? 0.09 : 0.045;
    }
    if (!this.lowPower) {
      this.flashes.push({ x: t.x, y: t.y - t.dh * 0.5, t: 0.18, kind: "impact" });
      this.burst(t.x, t.y - t.dh * 0.45, t.act === "rocker" ? 28 : 16, "#d4a84b", 160);
      this.burst(t.x, t.y - t.dh * 0.45, 8, "#f3ead8", 90);
    }
    this.floaters.push({
      x: t.x,
      y: t.y - t.dh * 0.78,
      text: mult > 1 ? `+${pts} ×${mult}` : `+${pts}`,
      life: 1.35,
      max: 1.35,
      color: "#f3ead8",
      size: t.act === "rocker" ? 110 : 92,
    });
  }

  burst(x: number, y: number, n: number, color: string, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * 0.3, speed);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 40,
        life: rand(0.35, 0.7),
        max: 0.7,
        size: rand(2, 5),
        color,
        rot: rand(0, 6),
        vr: rand(-8, 8),
      });
    }
  }

  omaRect() {
    const img = this.img(this.recoil > 0.02 ? "oma-recoil" : "oma");
    const h = 560;
    const w = img ? h * (img.width / img.height) : 530;
    const x = -10;
    const y = WORLD_H - h + 25;
    return { x, y, w, h, mx: x + w * 0.85, my: y + h * 0.15 };
  }

  loop = (now: number) => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.lowPower && this.last && now - this.last < 32) return;
    const dt = this.last ? (now - this.last) / 1000 : 0.016;
    this.last = now;
    if (dt > 0 && dt < 0.25) {
      this.fpsAcc += dt;
      this.fpsFrames++;
      if (dt > 0.033) this.slowFrames++;
      else this.slowFrames = Math.max(0, this.slowFrames - 1);
      if (this.fpsAcc >= 1.2) {
        const fps = this.fpsFrames / this.fpsAcc;
        if (fps < 42) this.setLowPower(true);
        this.fpsAcc = 0;
        this.fpsFrames = 0;
      }
      if (this.slowFrames > 18) this.setLowPower(true);
    }
    this.update(Math.min(dt, 0.1));
    this.draw();
  };

  update(dt: number) {
    tickChirps(dt);
    if (this.mode !== "playing") return;
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endRound();
      return;
    }
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.recoil = Math.max(0, this.recoil - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    if (this.strickT > 0) {
      this.strickT = Math.max(0, this.strickT - dt);
      if (this.strickT === 0) stopOmaKommando();
    }
    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    this.hudAcc += dt;
    if (this.pointerDown && this.strickT > 0 && this.mode === "playing") {
      this.shoot();
    }
    if (this.hudAcc > 0.12) {
      this.hudAcc = 0;
      this.emit();
    }
    const progress = 1 - this.timeLeft / 90;
    const spawnWait = 1.05 - progress * 0.62;
    this.spawnAcc -= (this.strickT > 0 ? dt * 2.2 : dt);
    if (this.spawnAcc <= 0) {
      this.spawnAcc = spawnWait * rand(0.7, 1.15);
      const n = progress > 0.5 && Math.random() < 0.55 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const r = Math.random();
        if (r < 0.5) this.spawnBush();
        else if (r < 0.72) this.spawnPeeker();
        else if (r < 0.9) this.spawnWalker(undefined, false);
        else this.spawnWalker(undefined, true);
      }
    }
    this.hippieT -= dt;
    if (this.hippieT <= 0 && (this.hippieCount || 0) < 2) {
      this.hippieCount = (this.hippieCount || 0) + 1;
      this.hippieT = this.hippieCount === 1 ? rand(35, 45) : 9999;
      this.spawnHippie();
    }
    this.rockerT -= dt;
    if (this.rockerT <= 0) {
      this.rockerT = rand(13, 19);
      this.spawnRocker();
    }
    this.carpetT -= dt;
    if (this.carpetT <= 0) {
      this.carpetT = rand(16, 24);
      this.spawnCarpet();
    }
    this.opaT -= dt;
    if (this.opaT <= 0) {
      this.opaT = rand(9, 15);
      this.spawnOpa();
    }
    for (const t of this.targets) {
      t.frameT += dt;
      const fps =
        t.state === "falling"
          ? 10
          : t.act === "run"
            ? 12
            : t.act === "walk"
              ? 8
              : t.act === "peek"
                ? 4
                : t.act === "bush"
                  ? 6
                  : 0;
      if (fps && t.frameT > 1 / fps) {
        t.frameT = 0;
        t.frame = (t.frame + 1) % 4;
      }
      if (t.state === "falling") {
        if (t.act === "opa") {
          t.vy = 0;
          if (t.phase !== "leave") {
            t.phaseT += dt;
            t.vx = 0;
            t.rot = 0;
            t.facing = 1;
            if (t.phaseT >= OPA_HIT_HOLD) {
              t.phase = "leave";
              t.phaseT = 0;
              t.facing = t.x < WORLD_W / 2 ? -1 : 1;
              t.vx = t.facing * 220;
            }
          } else {
            t.phaseT += dt;
            t.x += t.vx * dt + Math.sin(t.phaseT * 22) * 210 * dt;
            t.y = 1180 + Math.abs(Math.sin(t.phaseT * 20)) * 10;
            t.rot = Math.sin(t.phaseT * 22) * 0.16;
          }
          continue;
        }
        t.vy += 980 * dt;
        t.x += t.vx * (this.strickT > 0 ? dt * 1.8 : dt);
        t.y += t.vy * dt;
        t.rot += (t.vx >= 0 ? 1 : -1) * 5.5 * dt;
        continue;
      }
      if (t.act === "carpet") {
        t.x += t.vx * dt;
        t.phaseT += dt * 3.2;
        t.y = 340 + Math.sin(t.phaseT) * 45;
        t.rot = Math.cos(t.phaseT) * 0.12 * (t.vx > 0 ? 1 : -1);
        t.frameT += dt;
        if (t.frameT > 0.14) {
          t.frameT = 0;
          t.frame = (t.frame + 1) % 2;
        }
        continue;
      }
      if (t.act === "hippie") {
        if (t.phase === "in") {
          t.y += t.vy * dt;
          if (t.y >= 1040) {
            t.y = 1040;
            t.vy = 0;
            t.phase = "hold";
            t.phaseT = 0;
            this.burst(t.x, 1040, 16, "#cbd5e1", 130);
          }
        } else if (t.phase === "hold") {
          t.phaseT += dt;
          const openStart = (t as any).openStart || 2.0;
          const openEnd = openStart + ((t as any).openDur || 2.5);
          const standMax = (t as any).standMax || 8.0;
          const wobbleStart = t.phaseT <= 0.5;
          const wobbleEnd = t.phaseT >= (standMax - 0.7) && t.phaseT <= standMax;
          if (wobbleStart || wobbleEnd) {
            t.rot = Math.sin(t.phaseT * 28) * 0.08;
          } else {
            t.rot = 0;
          }
          if (t.phaseT > standMax) {
            t.phase = "out";
            t.phaseT = 0;
            this.burst(t.x, 1000, 24, "#cbd5e1", 140);
          }
        } else if (t.phase === "out") {
          t.x = -999;
        }
        continue;
      }
      if (t.act === "walk" || t.act === "run" || t.act === "rocker" || t.act === "opa") {
        t.x += t.vx * dt;
        continue;
      }
      t.phaseT += dt;
      if (t.act === "peek") {
        const tree = t.hide >= 0 ? TREES[t.hide] : null;
        if (t.phase === "in") {
          t.reveal = clamp(t.phaseT / 0.7, 0, 1);
          if (t.phaseT > 0.7) {
            t.phase = "hold";
            t.phaseT = -rand(0.85, 2.1);
            t.reveal = 1;
          }
        } else if (t.phase === "hold") {
          t.reveal = 1;
          if (t.phaseT > 0) {
            if (Math.random() < 0.48) this.dashOut(t, Math.random() < 0.62);
            else {
              t.phase = "out";
              t.phaseT = 0;
            }
          }
        } else if (t.phase === "out") {
          t.reveal = 1 - clamp(t.phaseT / 0.48, 0, 1);
          if (t.phaseT > 0.52) t.x = -999;
        }
        if (tree && t.x !== -999) {
          const n = 210 * t.scale;
          t.x = tree.x + t.facing * (tree.trunkW * 0.16 + n * 0.36 * t.reveal);
          t.y = tree.y;
        }
      } else if (t.act === "bush") {
        if (t.phase === "in") {
          t.reveal = clamp(t.phaseT / 0.7, 0, 0.5);
          if (t.phaseT > 0.7) {
            t.phase = "hold";
            t.phaseT = -rand(1.15, 2.5);
          }
        } else if (t.phase === "hold") {
          t.reveal = 0.5 + Math.sin(t.phaseT * 2.2) * 0.04;
          if (t.phaseT > 0) {
            if (Math.random() < 0.16) this.dashOut(t, Math.random() < 0.45);
            else {
              t.phase = "out";
              t.phaseT = 0;
            }
          }
        } else if (t.phase === "out") {
          t.reveal = 0.5 * (1 - clamp(t.phaseT / 0.48, 0, 1));
          if (t.phaseT > 0.52) t.x = -999;
        }
        if (t.x !== -999) this.placeBush(t);
      }
    }
    this.targets = this.targets.filter((t) => {
      if (t.x === -999) {
        this.freeHide(t);
        return false;
      }
      if (t.state === "falling") {
        if (t.act === "opa") return t.vx > 0 ? t.x < 1760 : t.x > -160;
        return t.y < 1060;
      }
      if (t.act === "walk" || t.act === "run" || t.act === "rocker" || t.act === "opa") {
        if (t.y >= 620 && t.x < OMA_KEEP_X) {
          this.freeHide(t);
          return false;
        }
        return t.vx > 0 ? t.x < 1760 : t.x > -160;
      }
      return true;
    });
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      p.rot += p.vr * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 62 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    for (const f of this.flashes) f.t -= dt;
    this.flashes = this.flashes.filter((f) => f.t > 0);
  }

  spriteFor(t: Target) {
    if (t.act === "hippie") {
      if (t.state === "falling") return this.img("tonne-umgekippt") || this.img("tonne-zu");
      const oS = (t as any).openStart || 2.0; const oE = oS + ((t as any).openDur || 2.5);
      if (t.phase === "hold" && t.phaseT >= oS && t.phaseT < oE) return this.img("tonne-hippie") || this.img("tonne-zu");
      return this.img("tonne-zu");
    }
    if (t.act === "opa") {
      const showHit = t.state === "falling" && t.phase !== "leave";
      return this.img(showHit ? "opa_hit" : "opa_walk");
    }
    if (t.act === "carpet") return this.img(t.frame % 2 === 0 ? "talahin_1" : "talahin_2");
    if (t.act === "rocker") return this.img("bahndidos");
    if (t.state === "falling") return this.img(`talahon-hit-${(t.frame % 4) + 1}`);
    if (t.act === "run") return this.img(`talahon-run-${(t.frame % 4) + 1}`);
    const base = t.variant === "b" ? "talahon-walk-b" : "talahon-walk";
    return this.img(`${base}-${(t.frame % 4) + 1}`);
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = this.lowPower ? "low" : "high";
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    const shake = (this.reduced || this.mode !== "playing") ? 0 : this.trauma * this.trauma * (this.strickT > 0 ? 1.85 : 1);
    const ox = shake ? (Math.random() * 2 - 1) * 14 * shake : 0;
    const oy = shake ? (Math.random() * 2 - 1) * 10 * shake : 0;
    ctx.translate(ox, oy);
    const bg = this.img("park-bg");
    if (bg) {
      const targetRatio = WORLD_W / WORLD_H;
      const srcW = bg.height * targetRatio;
      const srcX = (bg.width - srcW) / 2;
      ctx.drawImage(bg, srcX, 0, srcW, bg.height, 0, 0, WORLD_W, WORLD_H);
    } else {
      ctx.fillStyle = "#6ea0c8";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      ctx.fillStyle = "#3d6b3a";
      ctx.fillRect(0, 800, WORLD_W, WORLD_H);
    }
    for (const hole of this.holes) {
      ctx.fillStyle = `rgba(10,10,10,${0.55 * hole.a})`;
      ctx.beginPath();
      ctx.ellipse(hole.x, hole.y, hole.r, hole.r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const sorted = this.targets.slice().sort((a, b) => (a.z !== b.z ? a.z - b.z : a.y - b.y));

    // Wollbalken HUD (Nur im aktiven Spiel anzeigen)
    const isPlaying = this.mode === "playing";
    if (!isPlaying) return;
    const barX = 605;
    const barY = 205;
    const barW = 210;
    const barH = 18;
    const maxCombo = 13;
    const isStrickActive = (this.strickT || 0) > 0;

    if (isStrickActive) {
      ctx.globalAlpha = 0.85 + Math.sin(Date.now() / 80) * 0.15;
    }

    ctx.fillStyle = "rgba(20, 20, 20, 0.75)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 9);
    ctx.fill();

    const progress = isStrickActive
      ? Math.max(0, Math.min(1, this.strickT / 5.0))
      : Math.max(0, Math.min(1, (this.combo || 0) / maxCombo));

    if (progress > 0) {
      const fillW = Math.max(barH, barW * progress);
      const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      if (isStrickActive) {
        grad.addColorStop(0, "#FFD700");
        grad.addColorStop(1, "#FF2200");
      } else {
        grad.addColorStop(0, "#E91E63");
        grad.addColorStop(1, "#FF5722");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, 9);
      ctx.fill();
    }

    const iconProgress = Math.min(1, (this.combo || 0) / maxCombo);
    const woolRadius = 20 + (isStrickActive ? 22 : iconProgress * 22);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${woolRadius * 1.3}px sans-serif`;
    ctx.fillText(isStrickActive ? "🔥" : "🧶", barX + barW, barY + barH / 2);

    let treeDrawn = false;
    for (const t of sorted) {
      if (!treeDrawn && t.z >= 0.30) {
        const tree = this.img("tree");
        if (tree) {
          const targetRatio = WORLD_W / WORLD_H;
          const srcW = tree.height * targetRatio;
          const srcX = (tree.width - srcW) / 2;
          ctx.drawImage(tree, srcX, 0, srcW, tree.height, 0, 0, WORLD_W, WORLD_H);
        }
        treeDrawn = true;
      }
      this.drawTarget(t);
    }
    if (!treeDrawn) {
      const tree = this.img("tree");
      if (tree) {
        const targetRatio = WORLD_W / WORLD_H;
        const srcW = tree.height * targetRatio;
        const srcX = (tree.width - srcW) / 2;
        ctx.drawImage(tree, srcX, 0, srcW, tree.height, 0, 0, WORLD_W, WORLD_H);
      }
    }

    if (this.strickT > 0) {
      ctx.save();
      const pulse = 1 + Math.sin(Date.now() / 90) * 0.06;
      ctx.translate(WORLD_W / 2, 380);
      ctx.scale(pulse, pulse);
      ctx.textAlign = "center";

      ctx.fillStyle = "rgba(185, 28, 28, 0.85)";
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-260, -32, 520, 64, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = "900 32px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("⚡ STRICKNADELKOMMANDO! ⚡", 0, 11);
      ctx.restore();
    }

    const foliage = this.img("foliage");
    if (foliage) ctx.drawImage(foliage, 0, WORLD_H - 260, WORLD_W, 260);
    const oma = this.omaRect();
    ctx.globalAlpha = 1.0;
    const omaImg = this.img(this.recoil > 0.02 ? "oma-recoil" : "oma");
    if (omaImg) {
      const kick = this.recoil > 0 ? -6 : 0;
      ctx.drawImage(omaImg, oma.x, oma.y + kick, oma.w, oma.h);
    }
    if (!this.lowPower) for (const p of this.particles) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (!this.lowPower) for (const f of this.flashes) {
      const key =
        f.kind === "muzzle"
          ? `muzzle-${clamp(4 - Math.ceil(f.t * 20), 1, 4)}`
          : `impact-${clamp(4 - Math.ceil(f.t * 16), 1, 4)}`;
      const img = this.img(key);
      if (!img) continue;
      const size = f.kind === "muzzle" ? 90 : 130;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = clamp(f.t * 8, 0, 1);
      ctx.drawImage(img, f.x - size / 2, f.y - size / 2, size, size);
      ctx.restore();
    }
    ctx.restore();
    for (const f of this.floaters) {
      ctx.save();
      ctx.globalAlpha = clamp((f.life / f.max) * 1.35, 0, 1);
      const sz = f.text.includes("Wallah") ? 58 : (f.text.startsWith("-") ? 48 : 40);
      ctx.font = `900 ${sz}px sans-serif`;
      ctx.fillStyle = f.color;
      ctx.strokeStyle = "rgba(10,10,10,0.82)";
      ctx.lineWidth = 7;
      ctx.textAlign = "center";
      ctx.strokeText(f.text, f.x + ox, f.y + oy);
      ctx.fillText(f.text, f.x + ox, f.y + oy);
      ctx.restore();
    }
    
    if (this.mode === "playing") {
      const activeHippie = this.targets.find(t => t.act === "hippie" && t.state === "alive" && t.phase !== "out");
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (!activeHippie && this.hippieT <= 5 && this.hippieT > 0 && (this.hippieCount || 0) < 2) {
        const warnPulse = 1 + Math.sin(Date.now() * 0.015) * 0.08;
        ctx.font = "900 " + Math.round(18 * warnPulse) + "px sans-serif";
        ctx.fillStyle = "#f59e0b";
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 5;
        const msg = "⚠️ HIPPIE IN: " + Math.ceil(this.hippieT) + "s ⚠️";
        ctx.strokeText(msg, WORLD_W / 2, 215);
        ctx.fillText(msg, WORLD_W / 2, 215);
      } else if (activeHippie && activeHippie.phase === "hold") {
        const oS = (activeHippie as any).openStart || 2.0;
        const oE = oS + ((activeHippie as any).openDur || 2.5);
        if (activeHippie.phaseT >= oS && activeHippie.phaseT < oE) {
          ctx.font = "900 19px sans-serif";
          ctx.fillStyle = "#22c55e";
          ctx.strokeStyle = "rgba(0,0,0,0.85)";
          ctx.lineWidth = 5;
          ctx.strokeText("🎯 JETZT TREFFEN!", WORLD_W / 2, 215);
          ctx.fillText("🎯 JETZT TREFFEN!", WORLD_W / 2, 215);
        }
      }
      ctx.restore();
    }

    if (this.mode === "playing" || this.mode === "paused") this.drawCrosshair();
  }

  clipOccluders(_ctx: CanvasRenderingContext2D, _t: Target) {
    return;
  }

  drawTarget(t: Target) {
    const sprite = this.spriteFor(t);
    const ctx = this.ctx;
    let w = 140 * t.scale;
    let h = 180 * t.scale;
    if (sprite) {
      const ratio = sprite.width / sprite.height;
      h =
        (t.act === "hippie" ? 260 : t.act === "rocker" ? 430 : t.act === "opa" ? 380
          : t.act === "peek"
            ? 340
            : t.act === "bush"
              ? 335
              : 320) * t.scale;
      w = h * ratio;
    }
    t.dw = w;
    t.dh = h;
    if (t.act === "bush" && t.state === "alive") this.placeBush(t);
    ctx.save();
    if (t.act === "walk" || t.act === "run" || t.state === "falling") {
      this.clipOccluders(ctx, t);
    }
    if (t.act === "peek" && t.state === "alive" && t.hide >= 0) {
      const tree = TREES[t.hide]!;
      ctx.beginPath();
      if (t.facing > 0) ctx.rect(tree.x - 2, 0, WORLD_W, WORLD_H);
      else ctx.rect(0, 0, tree.x + 2, WORLD_H);
      ctx.clip();
    }
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    const opaLookAtCamera = t.act === "opa" && t.state === "falling" && t.phase !== "leave";
    if (!opaLookAtCamera && t.facing < 0) ctx.scale(-1, 1);
    if (t.act === "bush" && t.state === "alive" && t.reveal < 0.98) {
      const r = clamp(t.reveal, 0.12, 1);
      ctx.beginPath();
      ctx.rect(-w / 2, -h, w, h * r);
      ctx.clip();
    }
    if (sprite) ctx.drawImage(sprite, -w / 2, -h, w, h);
    else {
      ctx.fillStyle = "#222";
      ctx.fillRect(-w / 2, -h, w, h);
    }
    ctx.restore();
  }

  drawCrosshair() {
    const ctx = this.ctx;
    const x = this.aimX;
    const y = this.aimY;
    const kick = this.fireCd > 0.14 ? 4 : 0;
    ctx.save();
    ctx.strokeStyle = "#f3ead8";
    ctx.fillStyle = "#f3ead8";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(x, y, 16 + kick, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - 22 - kick);
    ctx.lineTo(x, y - 14 - kick);
    ctx.moveTo(x, y + 14 + kick);
    ctx.lineTo(x, y + 22 + kick);
    ctx.moveTo(x - 22 - kick, y);
    ctx.lineTo(x - 14 - kick, y);
    ctx.moveTo(x + 14 + kick, y);
    ctx.lineTo(x + 22 + kick, y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(10,10,10,0.55)";
    ctx.lineWidth = 7;
    ctx.globalCompositeOperation = "destination-over";
    ctx.beginPath();
    ctx.arc(x, y, 16 + kick, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  destroy() {
    this.destroyed = true;
    cancelOmaSpeech();
    stopParkAmbience();
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("keydown", this.onKey);
    document.removeEventListener("visibilitychange", this.onVis);
  }
}

export { emptyHud };
