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
  { x: 795, y: 560, z: 0.5, trunkW: 65, scale: 0.72, facing: -1 },
  { x: 805, y: 560, z: 0.5, trunkW: 65, scale: 0.72, facing: 1 }
];

const BUSHES = [
  { x: 140, y: 475, z: 0.22, scale: 0.28, w: 60, h: 38, facing: 1 },
  { x: 1460, y: 475, z: 0.22, scale: 0.28, w: 60, h: 38, facing: -1 }
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
    this.spawnWalker(0, false);
    this.spawnWalker(1, false);
    this.spawnWalker(2, false);
    this.spawnWalker(3, false);
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
    this.spawnWalker(1, Math.random() < 0.4);
  }

  spawnBush() {
    if (this.aliveCount() >= MAX_ALIVE) return;
    this.spawnWalker(0, false);
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
    for (const bush of BUSHES) {
      if (bush.z <= t.z + 0.05) continue;
      if (x >= bush.x - bush.w / 2 && x <= bush.x + bush.w / 2 && y <= bush.y && y >= bush.y - bush.h)
        return true;
    }
    return false;
  }

  hitTest(t: Target, x: number, y: number) {
    if ((t.act === "walk" || t.act === "run") && this.occludesPoint(t, x, y)) return false;
    const w = t.dw || 80;
    const h = t.dh || 80;
    let left = t.x - w * 0.38;
    let right = t.x + w * 0.38;
    let top = t.y - h * 0.92;
    let bottom = t.y - h * 0.06;
    if (t.act === "peek" && t.hide >= 0) {
      const tree = TREES[t.hide]!;
      const r = Math.max(0.2, t.reveal);
      if (t.facing > 0) {
        left = tree.x;
        right = t.x + w * 0.42 * r;
      } else {
        left = t.x - w * 0.42 * r;
        right = tree.x;
      }
      top = t.y - h * 0.9;
      bottom = t.y - h * 0.1;
    }
    if (t.act === "bush") {
      top = t.y - h;
      bottom = t.y - h * (1 - Math.max(0.15, t.reveal));
      left = t.x - w * 0.32;
      right = t.x + w * 0.32;
    }
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  kill(t: Target) {
    t.state = "falling";
    t.frame = 0;
    t.frameT = 0;
    t.vy = -180;
    t.vx = (this.aimX > t.x ? -1 : 1) * 90;
    this.freeHide(t);
    this.hits++;
    this.combo += 1;
    this.comboT = COMBO_WINDOW;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    const mult = Math.min(5, 1 + Math.floor((this.combo - 1) / 3));
    const pts = t.points * mult;
    this.score += pts;
    playHit(this.combo);
    if (!this.reduced) {
      this.trauma = Math.min(1, this.trauma + (t.act === "rocker" ? 0.7 : 0.38));
      this.hitstop = t.act === "rocker" ? 0.09 : 0.045;
    }
    this.flashes.push({ x: t.x, y: t.y - t.dh * 0.5, t: 0.18, kind: "impact" });
    this.burst(t.x, t.y - t.dh * 0.45, t.act === "rocker" ? 28 : 16, "#d4a84b", 160);
    this.burst(t.x, t.y - t.dh * 0.45, 8, "#f3ead8", 90);
    this.floaters.push({
      x: t.x,
      y: t.y - t.dh * 0.78,
      text: mult > 1 ? `${pts}  ×${mult}` : `+${pts}`,
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
    const w = img ? 455 * (img.width / img.height) : 440;
    return { x: 28, y: 467, w, h: 455, mx: 28 + w * 0.8, my: 644.45 };
  }

  loop = (now: number) => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = this.last ? (now - this.last) / 1000 : 0.016;
    this.last = now;
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
    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    this.hudAcc += dt;
    if (this.hudAcc > 0.12) {
      this.hudAcc = 0;
      this.emit();
    }
    const progress = 1 - this.timeLeft / 90;
    const spawnWait = 1.05 - progress * 0.62;
    this.spawnAcc -= dt;
    if (this.spawnAcc <= 0) {
      this.spawnAcc = spawnWait * rand(0.7, 1.15);
      const n = progress > 0.5 && Math.random() < 0.55 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const r = Math.random();
        if (r < 0.15) this.spawnBush();
        else if (r < 0.30) this.spawnPeeker();
        else if (r < 0.70) this.spawnWalker(undefined, false);
        else this.spawnWalker(undefined, true);
      }
    }
    this.rockerT -= dt;
    if (this.rockerT <= 0) {
      this.rockerT = rand(14, 24) - progress * 4;
      this.spawnRocker();
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
        t.vy += 980 * dt;
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        t.rot += (t.vx >= 0 ? 1 : -1) * 5.5 * dt;
        continue;
      }
      if (t.act === "walk" || t.act === "run" || t.act === "rocker") {
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
      if (t.state === "falling") return t.y < 1060;
      if (t.act === "walk" || t.act === "run" || t.act === "rocker") {
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
    const variant = t.variant === "b" ? "-b" : "";
    const act = t.act === "run" ? "run" : t.act === "rocker" ? "bahndidos" : t.state === "falling" ? "hit" : "walk";
    if (act === "bahndidos") return this.img("bahndidos");
    const f = ((t.frame % 4) + 1);
    return this.img(`talahon-${act}${variant}-${f}`) || this.img(`talahon-walk-${f}`) || this.img("talahon-walk-1");
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    const shake = this.reduced ? 0 : this.trauma * this.trauma;
    const ox = shake ? (Math.random() * 2 - 1) * 14 * shake : 0;
    const oy = shake ? (Math.random() * 2 - 1) * 10 * shake : 0;
    ctx.translate(ox, oy);
    const bg = this.img("park-bg");
    if (bg) ctx.drawImage(bg, 0, 0, WORLD_W, WORLD_H);
    else {
      ctx.fillStyle = "#6ea0c8";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      ctx.fillStyle = "#3d6b3a";
      ctx.fillRect(0, 405, WORLD_W, WORLD_H);
    }
    for (const hole of this.holes) {
      ctx.fillStyle = `rgba(10,10,10,${0.55 * hole.a})`;
      ctx.beginPath();
      ctx.ellipse(hole.x, hole.y, hole.r, hole.r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const sorted = this.targets.slice().sort((a, b) => a.z - b.z);
    for (const t of sorted) this.drawTarget(t);
    const foliage = this.img("foliage");
    if (foliage) ctx.drawImage(foliage, 0, 698, WORLD_W, 210);
    const oma = this.omaRect();
    const omaImg = this.img(this.recoil > 0.02 ? "oma-recoil" : "oma");
    if (omaImg) {
      const kick = this.recoil > 0 ? -6 : 0;
      ctx.drawImage(omaImg, oma.x, oma.y + kick, oma.w, oma.h);
    }
    for (const p of this.particles) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    for (const f of this.flashes) {
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
      ctx.font = `800 ${f.size}px 'Bebas Neue', sans-serif`;
      ctx.fillStyle = f.color;
      ctx.strokeStyle = "rgba(10,10,10,0.82)";
      ctx.lineWidth = 10;
      ctx.textAlign = "center";
      ctx.strokeText(f.text, f.x + ox, f.y + oy);
      ctx.fillText(f.text, f.x + ox, f.y + oy);
      ctx.restore();
    }
    if (this.mode === "playing" || this.mode === "paused") this.drawCrosshair();
  }

  clipOccluders(_ctx: CanvasRenderingContext2D, _t: Target) {}

  drawCrosshair() {
    this.ctx.save();
    this.ctx.fillStyle = "#ff0000";
    this.ctx.font = "bold 24px monospace";
    this.ctx.fillText("BUILD_TEST_V2", 30, 40);
    this.ctx.restore();
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
