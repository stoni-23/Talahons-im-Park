let muted = false;
let audioCtx: AudioContext | null = null;
let bgmAudio: HTMLAudioElement | null = null;
let activeSounds: HTMLAudioElement[] = [];

let talahonHitCount = 0;
let omaHitCount = 0;
let midGameTimer: any = null;
let midGamePlayed = false;

const soundPool: Record<string, HTMLAudioElement[]> = {};

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function regAudio(name: string, src: string, poolSize = 2, loop = false) {
  try {
    soundPool[name] = [];
    for (let i = 0; i < poolSize; i++) {
      const a = new Audio(src);
      a.preload = "auto";
      a.loop = loop;
      soundPool[name].push(a);
    }
  } catch (e) {}
}

export function playVoice(src: string, vol = 1.0) {
  if (muted) return;
  try {
    const a = new Audio(src);
    a.volume = vol;
    activeSounds.push(a);

    a.onended = () => {
      activeSounds = activeSounds.filter((item) => item !== a);
    };

    a.play().catch(() => {
      const altSrc = src.startsWith("/sounds/") ? src.replace("/sounds/", "/") : "/sounds" + src;
      const fallback = new Audio(altSrc);
      fallback.volume = vol;
      activeSounds.push(fallback);
      fallback.onended = () => {
        activeSounds = activeSounds.filter((item) => item !== fallback);
      };
      fallback.play().catch(() => {});
    });
  } catch (e) {}
}

export function stopAllVoices() {
  if (midGameTimer) {
    clearTimeout(midGameTimer);
    midGameTimer = null;
  }
  activeSounds.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  });
  activeSounds = [];
}

export async function preloadSounds() {
  regAudio("bgm", "/sounds/Bgm_main.mp3", 1, true);
  regAudio("talahin", "/talahin_intro.wav", 2, false);
  regAudio("rocker", "/rocker_intro.wav", 2, false);
  regAudio("oma_kommando", "/oma_kommando.wav", 2, false);
}

export function startParkAmbience() {
  if (muted) return;
  if (soundPool["bgm"] && soundPool["bgm"][0]) {
    bgmAudio = soundPool["bgm"][0];
    bgmAudio.volume = 0.45;
    bgmAudio.playbackRate = 1.0;
    bgmAudio.play().catch(() => {});
  }
}

export function stopParkAmbience() {
  stopAllVoices();
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmAudio.playbackRate = 1.0;
  }
}

export function setParkPaused(paused: boolean) {
  if (paused) {
    stopAllVoices();
    if (bgmAudio) bgmAudio.pause();
  } else {
    if (bgmAudio && !muted) bgmAudio.play().catch(() => {});
  }
}

export function playShot() {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {}
}

export function playHit(combo = 1) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const pitch = Math.min(1.0 + (combo - 1) * 0.15, 2.5);
    const baseFreq = 260 * pitch;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.1);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {}
}

export function playMiss() {}

export function onGameStartAudio() {
  stopAllVoices();
  talahonHitCount = 0;
  omaHitCount = 0;
  midGamePlayed = false;

  const delay = Math.floor(Math.random() * (35000 - 15000 + 1)) + 15000;
  midGameTimer = setTimeout(() => {
    if (!midGamePlayed) {
      midGamePlayed = true;
      const list = ["/scharfe_sybille.wav", "/oma_guliguli.wav"];
      playVoice(list[Math.floor(Math.random() * list.length)]);
    }
  }, delay);
}

export function playOpaSpawn() { playVoice("/opa_aus_dem_weg.wav"); }
export function playOpaHit() { playVoice("/parkleuchte.wav"); }

export function playRocker() {
  const rockerSounds = ["/rocker_brum.wav", "/rocker_powerbank.wav", "/rocker_intro.wav"];
  playVoice(rockerSounds[Math.floor(Math.random() * rockerSounds.length)], 0.9);
}

export function playTalahonHitVoice() {
  talahonHitCount++;
  if (talahonHitCount % 16 === 0) {
    playVoice("/walla_billah.wav", 0.55);
  }
}

export function playOmaHitVoice() {
  omaHitCount++;
  if (omaHitCount % 9 === 0) {
    playVoice("/und_tschuess.wav");
  }
}

export function playRoundEnd() {
  if (midGameTimer) {
    clearTimeout(midGameTimer);
    midGameTimer = null;
  }
  playVoice("/oma_tschuessikofski.wav");
}

export function playTalahinIntro() {
  if (muted || !soundPool["talahin"]) return;
  const pool = soundPool["talahin"];
  const a = pool.shift()!;
  pool.push(a);
  a.volume = 0.9;
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function playOmaKommando() {
  if (muted || !soundPool["oma_kommando"]) return;
  const pool = soundPool["oma_kommando"];
  const a = pool.shift()!;
  pool.push(a);
  a.volume = 1.0;
  a.currentTime = 0;
  a.play().catch(() => {});
  if (bgmAudio) bgmAudio.playbackRate = 1.3;
}

export function stopOmaKommando() {
  if (bgmAudio) bgmAudio.playbackRate = 1.0;
}

export function playOmaLine() {
  playVoice("/stricknase.mp3", 1.0);
}

export function cancelOmaSpeech() {
  stopAllVoices();
}

export function tickChirps(_dt?: number) {}
export function isMuted() { return muted; }
export function setMuted(m: boolean) {
  muted = m;
  if (bgmAudio) {
    if (m) bgmAudio.pause();
    else bgmAudio.play().catch(() => {});
  }
  if (m) stopAllVoices();
}

export function resumeAudio() { getCtx(); }
export function unlockAudio() { getCtx(); }
export function startBgm() {}
