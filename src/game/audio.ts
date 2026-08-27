let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
let unlocked = false;
let muted = false;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    sfx = ctx.createGain();
    music = ctx.createGain();
    sfx.gain.value = 0.85;
    music.gain.value = 0.5;
    master.gain.value = muted ? 0 : 1;
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio() {
  const ac = audio();
  if (ac.state === "suspended") ac.resume();
  unlocked = true;
}

export function setMuted(next: boolean) {
  muted = next;
  if (master) master.gain.setTargetAtTime(next ? 0 : 1, audio().currentTime, 0.03);
  if (next) cancelOmaSpeech();
}

export function isMuted() {
  return muted;
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") ctx.resume();
}

function noiseBuffer(seconds: number, falloff = 2) {
  const ac = audio();
  const length = Math.max(1, Math.floor(ac.sampleRate * seconds));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / length;
    data[i] = (Math.random() * 2 - 1) * (1 - t) ** falloff;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  return src;
}

function beep(freq: number, type: OscillatorType, dur: number, gain = 0.2) {
  const ac = audio();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + dur);
  osc.connect(g);
  g.connect(sfx!);
  osc.start();
  osc.stop(ac.currentTime + dur + 0.02);
}

export function playShot() {
  if (!unlocked || muted) return;
  const ac = audio();
  const noise = noiseBuffer(0.14, 2.4);
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400 + Math.random() * 400;
  filter.Q.value = 0.7;
  const g = ac.createGain();
  g.gain.value = 0.9;
  noise.connect(filter);
  filter.connect(g);
  g.connect(sfx!);
  noise.playbackRate.value = 0.92 + Math.random() * 0.18;
  noise.start();

  const thump = ac.createOscillator();
  const tg = ac.createGain();
  thump.type = "sine";
  thump.frequency.value = 90 + Math.random() * 30;
  tg.gain.setValueAtTime(0.55, ac.currentTime);
  tg.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + 0.16);
  thump.connect(tg);
  tg.connect(sfx!);
  thump.start();
  thump.stop(ac.currentTime + 0.18);

  const click = ac.createOscillator();
  const cg = ac.createGain();
  click.type = "triangle";
  click.frequency.value = 1800 + Math.random() * 600;
  cg.gain.setValueAtTime(0.18, ac.currentTime);
  cg.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + 0.04);
  click.connect(cg);
  cg.connect(sfx!);
  click.start();
  click.stop(ac.currentTime + 0.05);
}

export function playHit(combo: number) {
  if (!unlocked || muted) return;
  const ac = audio();
  const noise = noiseBuffer(0.08, 1.6);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 600;
  const g = ac.createGain();
  g.gain.value = 0.35;
  noise.connect(hp);
  hp.connect(g);
  g.connect(sfx!);
  noise.playbackRate.value = 1 + Math.min(combo, 6) * 0.04;
  noise.start();
  const a = 520 + Math.min(combo, 8) * 70 + Math.random() * 40;
  beep(a, "square", 0.09, 0.07);
  beep(a * 1.5, "sine", 0.12, 0.05);
}

export function playMiss() {
  if (!unlocked || muted) return;
  beep(140, "sine", 0.08, 0.08);
  const n = noiseBuffer(0.05, 3);
  const g = audio().createGain();
  g.gain.value = 0.15;
  n.connect(g);
  g.connect(sfx!);
  n.start();
}

export function playRocker() {
  if (!unlocked || muted) return;
  const ac = audio();
  const osc = ac.createOscillator();
  const lp = ac.createBiquadFilter();
  const g = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(70, ac.currentTime);
  osc.frequency.linearRampToValueAtTime(110, ac.currentTime + 0.8);
  lp.type = "lowpass";
  lp.frequency.value = 380;
  g.gain.setValueAtTime(1e-4, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.08);
  g.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + 1.6);
  osc.connect(lp);
  lp.connect(g);
  g.connect(sfx!);
  osc.start();
  osc.stop(ac.currentTime + 1.7);
}

export function playRoundEnd() {
  if (!unlocked || muted) return;
  const ac = audio();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1400, ac.currentTime);
  osc.frequency.linearRampToValueAtTime(900, ac.currentTime + 0.55);
  g.gain.setValueAtTime(0.12, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + 0.6);
  osc.connect(g);
  g.connect(sfx!);
  osc.start();
  osc.stop(ac.currentTime + 0.62);
}

export function tickChirps(_dt: number) {
  /* birds come from the park loop */
}

let omaBuf: AudioBuffer | null = null;
let omaSource: AudioBufferSourceNode | null = null;
let parkStop: (() => void) | null = null;
let parkGain: GainNode | null = null;

export async function preloadSounds() {
  const ac = audio();
  if (omaBuf) return;
  try {
    const res = await fetch("/assets/oma-stricknase.mp3");
    const arr = await res.arrayBuffer();
    omaBuf = await ac.decodeAudioData(arr.slice(0));
  } catch {
    omaBuf = null;
  }
}

export function playOmaLine() {
  cancelOmaSpeech();
  if (!unlocked || muted) return;
  const ac = audio();
  if (omaBuf && sfx) {
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = omaBuf;
    g.gain.value = 1;
    src.connect(g);
    g.connect(sfx);
    omaSource = src;
    src.onended = () => {
      if (omaSource === src) omaSource = null;
    };
    src.start();
    return;
  }
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(
    "Die letzte, die unvorsichtig in meine Stricknadeln gegriffen hat, strickt jetzt mit der Nase.",
  );
  u.lang = "de-DE";
  u.rate = 0.86;
  u.pitch = 1.18;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

export function cancelOmaSpeech() {
  if (omaSource) {
    try {
      omaSource.stop();
    } catch {
      /* already stopped */
    }
    omaSource = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function pinkBuffer(seconds: number) {
  const ac = audio();
  const n = Math.max(1, Math.floor(ac.sampleRate * seconds));
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    data[i] = (b0 + b1 + b2 + w * 0.25) * 0.18;
  }
  return buf;
}

function parkBird() {
  if (!unlocked || muted) return;
  const base = 2200 + Math.random() * 1400;
  beep(base, "sine", 0.11, 0.035);
  setTimeout(() => beep(base * (0.72 + Math.random() * 0.12), "sine", 0.14, 0.028), 90);
  if (Math.random() < 0.4) {
    setTimeout(() => beep(base * 1.08, "triangle", 0.08, 0.02), 220);
  }
}

export function startParkAmbience() {
  stopParkAmbience();
  const ac = audio();
  if (!music) return;
  const g = ac.createGain();
  g.gain.value = 0;
  g.connect(music);
  g.gain.linearRampToValueAtTime(1, ac.currentTime + 0.7);
  parkGain = g;

  const windSrc = ac.createBufferSource();
  windSrc.buffer = pinkBuffer(7.5);
  windSrc.loop = true;
  const windFilter = ac.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 620;
  windFilter.Q.value = 0.55;
  const windGain = ac.createGain();
  windGain.gain.value = 0.14;
  const lfo = ac.createOscillator();
  const lfoG = ac.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.11;
  lfoG.gain.value = 260;
  lfo.connect(lfoG);
  lfoG.connect(windFilter.frequency);
  windSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(g);
  windSrc.start();
  lfo.start();

  const leafSrc = ac.createBufferSource();
  leafSrc.buffer = pinkBuffer(5.2);
  leafSrc.loop = true;
  const leafHp = ac.createBiquadFilter();
  leafHp.type = "highpass";
  leafHp.frequency.value = 1800;
  const leafGain = ac.createGain();
  leafGain.gain.value = 0.025;
  leafSrc.connect(leafHp);
  leafHp.connect(leafGain);
  leafGain.connect(g);
  leafSrc.start();

  const birdId = window.setInterval(() => {
    if (Math.random() < 0.72) parkBird();
  }, 2800);
  window.setTimeout(parkBird, 400);

  parkStop = () => {
    window.clearInterval(birdId);
    try {
      windSrc.stop();
      lfo.stop();
      leafSrc.stop();
    } catch {
      /* already stopped */
    }
    try {
      g.disconnect();
    } catch {
      /* already disconnected */
    }
    if (parkGain === g) parkGain = null;
  };
}

export function setParkPaused(paused: boolean) {
  if (!parkGain) return;
  const ac = audio();
  parkGain.gain.setTargetAtTime(paused ? 0.18 : 1, ac.currentTime, 0.12);
}

export function stopParkAmbience() {
  if (parkStop) {
    parkStop();
    parkStop = null;
  }
  parkGain = null;
}
