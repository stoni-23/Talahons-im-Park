import {
  cancelOmaSpeech,
  isMuted,
  playHit,
  playMiss,
  playOmaLine,
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

export const WORLD_W = 1600;
export const WORLD_H = 900;
const FIRE_CD = 0.26;
const COMBO_WINDOW = 1.05;
const MAX_ALIVE = 9;
const OMA_KEEP_X = 560;

const LANES = [
  { y: 532, scale: 0.52, z: 0.18, pts: 35, speed: 38 },
  { y: 586, scale: 0.72, z: 0.82, pts: 22, speed: 58 },
  { y: 642, scale: 0.94, z: 1.52, pts: 14, speed: 84 },
  { y: 698, scale: 1.16, z: 2.38, pts: 8, speed: 108 },
];

const TREES = [
  { x: 188, y: 578, z: 0.58, trunkW: 58, scale: 0.72, facing: 1 },
  { x: 412, y: 552, z: 0.32, trunkW: 40, scale: 0.56, facing: -1 },
  { x: 798, y: 568, z: 0.5, trunkW: 64, scale: 0.8, facing: -1 },
  { x: 1128, y: 560, z: 0.4, trunkW: 44, scale: 0.62, facing: 1 },
  { x: 1422, y: 574, z: 0.54, trunkW: 54, scale: 0.7, facing: -1 },
];

const BUSHES = [
  { x: 210, y: 535, z: 0.38, scale: 0.45, w: 80, h: 70, facing: 1 },
  { x: 460, y: 530, z: 0.35, scale: 0.42, w: 75, h: 65, facing: 1 },
  { x: 1290, y: 535, z: 0.38, scale: 0.46, w: 85, h: 70, facing: -1 },
  { x: 1485, y: 540, z: 0.42, scale: 0.50, w: 90, h: 75, facing: -1 },
];

const ASSET_KEYS = [
  "park-bg",
  "foliage",
  "oma",
  "oma-recoil",
  "bahndidos",
  "logo",
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
  };
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
  rockerT = 12;
  hudAcc = 0;
  id = 1;
  last = 0;
  raf = 0;
  reduced = false;
  onHud: (hud: Hud) => void;
  destroyed = false;
  pointerDown = false;
  peekBusy = new Set<number>();
  bushBusy = new Set<number>();

  constructor(canvas: HTMLCanvasElement, onHud: (hud: Hud) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.onHud = onHud;
    this.highScore = topScore();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    };
  }

  emit() {
    this.onHud(this.hud());
  }

  async boot() {
    await Promise.all(
      ASSET_KEYS.map(async (key) => {
        try {
          const img = await loadImage(
            `/assets/${key}.${key === "park-bg" ? "jpg" : "png"}`,
          );
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
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(WORLD_W * dpr);
    this.canvas.height = Math.floor(WORLD_H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  aliveCount() {
    return this.targets.reduce((n, t) => n + +(t.state === "alive"), 0);
  }

  start() {
    unlockAudio();
    playOmaLine();
    startParkAmbience();
    this.mode = "playing";
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
    this.targets = [];
    this.particles = [];
    this.floaters = [];
    this.holes = [];
    this.flashes = [];
    this.peekBusy.clear();
    this.bushBusy.clear();
    this.spawnAcc = 0.5;
    this.rockerT = rand(9, 14);
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
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewHigh = true;
    }
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
    if (this.aliveCount() >= MAX_ALIVE) return;
    const laneI =
      lane ??
      (Math.random() < 0.34 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.58 ? 2 : 3);
    const L = LANES[laneI]!;
    const run = running ?? Math.random() < 0.38;
    const near = L.y >= 620;
    const fromRight = near || Math.random() >= 0.5;
    const speed = L.speed * (run ? 2.2 : 1) * rand(0.88, 1.18);
    const start = x ?? (fromRight ? 1670 : -70);
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
    if (this.aliveCount() >= MAX_ALIVE) return;
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
    if (this.aliveCount() >= MAX_ALIVE) return;
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

  spawnRocker() {
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "rocker",
      variant: "a",
      x: 1780,
      y: 648,
      vx: -rand(480, 620),
      z: 2.2,
      facing: -1,
      points: 200,
      scale: 0.92,
      phase: "move",
    });
    playRocker();
  }

  freeHide(t: Target) {
    if (t.act === "peek" && t.hide >= 0) this.peekBusy.delete(t.hide);
    if (t.act === "bush" && t.hide >= 0) this.bushBusy.delete(t.hide);
    t.hide = -1;
  }

  dashOut(t: Target, run = true) {
    let dir = t.facing;
    if (t.x < OMA_KEEP_X + 40) dir = 1;
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

  shoot() {
    if (this.mode !== "playing" || this.fireCd > 0) return;
    this.fireCd = FIRE_CD;
    this.recoil = 0.12;
    this.shots++;
    playShot();
    if (!this.reduced) this.trauma = Math.min(1, this.trauma + 0.28);
    const oma = this.omaRect();
    this.flashes.push({ x: oma.mx, y: oma.my, t: 0.12, kind: "muzzle" });
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
    if (hit) this.kill(hit);
    else {
      playMiss();
      this.combo = 0;
      this.holes.push({ x: this.aimX, y: this.aimY, r: rand(4, 7), a: 1 });
      if (this.holes.length > 48) this.holes.shift();
      this.burst(this.aimX, this.aimY, 5, "#cfc4ae", 40);
    }
    this.emit();
  }

  occludesPoint(t: Target, x: number, y: number) {
    for (const tree of TREES) {
      if (tree.z <= t.z + 0.05) continue;
      if (x >= tree.x - tree.trunkW / 2 && x <= tree.x + tree.trunkW / 2 && y <= tree.y && y >= tree.y - 280)
        return true;
    }
    /* bush clipping removed */
    if (box) {
      ctx.beginPath();
      ctx.rect(-40, -40, 1680, 980);
      ctx.rect(box.x, box.y, box.w, box.h);
      ctx.clip("evenodd");
    }
  }

  drawTarget(t: Target) {
    const sprite = this.spriteFor(t);
    const ctx = this.ctx;
    let w = 140 * t.scale;
    let h = 180 * t.scale;
    if (sprite) {
      const ratio = sprite.width / sprite.height;
      h =
        (t.act === "rocker"
          ? 430
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
    if (t.facing < 0) ctx.scale(-1, 1);
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
    ctx.lineWidth = 2;
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
    ctx.lineWidth = 3;
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
