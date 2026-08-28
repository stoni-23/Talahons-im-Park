export type Mode = "title" | "playing" | "paused" | "results";
export type Act = "walk" | "run" | "peek" | "bush" | "rocker" | "opa" | "carpet";
export type Phase = "move" | "in" | "hold" | "out";
export type TargetState = "alive" | "falling";

export type Hud = {
  mode: Mode;
  score: number;
  timeLeft: number;
  combo: number;
  shots: number;
  hits: number;
  highScore: number;
  isNewHigh: boolean;
  bestCombo: number;
  muted: boolean;
  ready: boolean;
};

export type Target = {
  id: number;
  act: Act;
  variant: "a" | "b";
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  facing: number;
  points: number;
  scale: number;
  frame: number;
  frameT: number;
  state: TargetState;
  phase: Phase;
  phaseT: number;
  reveal: number;
  rot: number;
  dw: number;
  dh: number;
  hide: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
};

export type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
  max: number;
  color: string;
  size: number;
};

export type Hole = { x: number; y: number; r: number; a: number };
export type Flash = { x: number; y: number; t: number; kind: "muzzle" | "impact" };
