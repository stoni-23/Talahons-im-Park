import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Pause, i as Play, n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Djln0rvx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var master = null;
var sfx = null;
var music = null;
var unlocked = false;
var muted = false;
function audio() {
	if (!ctx) {
		ctx = new AudioContext();
		master = ctx.createGain();
		sfx = ctx.createGain();
		music = ctx.createGain();
		sfx.gain.value = .85;
		music.gain.value = .5;
		master.gain.value = muted ? 0 : 1;
		sfx.connect(master);
		music.connect(master);
		master.connect(ctx.destination);
	}
	return ctx;
}
function unlockAudio() {
	const ac = audio();
	if (ac.state === "suspended") ac.resume();
	unlocked = true;
}
function setMuted(next) {
	muted = next;
	if (master) master.gain.setTargetAtTime(next ? 0 : 1, audio().currentTime, .03);
	if (next) cancelOmaSpeech();
}
function isMuted() {
	return muted;
}
function resumeAudio() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function noiseBuffer(seconds, falloff = 2) {
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
function beep(freq, type, dur, gain = .2) {
	const ac = audio();
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	g.gain.setValueAtTime(gain, ac.currentTime);
	g.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + dur);
	osc.connect(g);
	g.connect(sfx);
	osc.start();
	osc.stop(ac.currentTime + dur + .02);
}
function playShot() {
	if (!unlocked || muted) return;
	const ac = audio();
	const noise = noiseBuffer(.14, 2.4);
	const filter = ac.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = 1400 + Math.random() * 400;
	filter.Q.value = .7;
	const g = ac.createGain();
	g.gain.value = .9;
	noise.connect(filter);
	filter.connect(g);
	g.connect(sfx);
	noise.playbackRate.value = .92 + Math.random() * .18;
	noise.start();
	const thump = ac.createOscillator();
	const tg = ac.createGain();
	thump.type = "sine";
	thump.frequency.value = 90 + Math.random() * 30;
	tg.gain.setValueAtTime(.55, ac.currentTime);
	tg.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + .16);
	thump.connect(tg);
	tg.connect(sfx);
	thump.start();
	thump.stop(ac.currentTime + .18);
	const click = ac.createOscillator();
	const cg = ac.createGain();
	click.type = "triangle";
	click.frequency.value = 1800 + Math.random() * 600;
	cg.gain.setValueAtTime(.18, ac.currentTime);
	cg.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + .04);
	click.connect(cg);
	cg.connect(sfx);
	click.start();
	click.stop(ac.currentTime + .05);
}
function playHit(combo) {
	if (!unlocked || muted) return;
	const ac = audio();
	const noise = noiseBuffer(.08, 1.6);
	const hp = ac.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = 600;
	const g = ac.createGain();
	g.gain.value = .35;
	noise.connect(hp);
	hp.connect(g);
	g.connect(sfx);
	noise.playbackRate.value = 1 + Math.min(combo, 6) * .04;
	noise.start();
	const a = 520 + Math.min(combo, 8) * 70 + Math.random() * 40;
	beep(a, "square", .09, .07);
	beep(a * 1.5, "sine", .12, .05);
}
function playMiss() {
	if (!unlocked || muted) return;
	beep(140, "sine", .08, .08);
	const n = noiseBuffer(.05, 3);
	const g = audio().createGain();
	g.gain.value = .15;
	n.connect(g);
	g.connect(sfx);
	n.start();
}
function playRocker() {
	if (!unlocked || muted) return;
	const ac = audio();
	const osc = ac.createOscillator();
	const lp = ac.createBiquadFilter();
	const g = ac.createGain();
	osc.type = "sawtooth";
	osc.frequency.setValueAtTime(70, ac.currentTime);
	osc.frequency.linearRampToValueAtTime(110, ac.currentTime + .8);
	lp.type = "lowpass";
	lp.frequency.value = 380;
	g.gain.setValueAtTime(1e-4, ac.currentTime);
	g.gain.exponentialRampToValueAtTime(.12, ac.currentTime + .08);
	g.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + 1.6);
	osc.connect(lp);
	lp.connect(g);
	g.connect(sfx);
	osc.start();
	osc.stop(ac.currentTime + 1.7);
}
function playRoundEnd() {
	if (!unlocked || muted) return;
	const ac = audio();
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = "sine";
	osc.frequency.setValueAtTime(1400, ac.currentTime);
	osc.frequency.linearRampToValueAtTime(900, ac.currentTime + .55);
	g.gain.setValueAtTime(.12, ac.currentTime);
	g.gain.exponentialRampToValueAtTime(1e-4, ac.currentTime + .6);
	osc.connect(g);
	g.connect(sfx);
	osc.start();
	osc.stop(ac.currentTime + .62);
}
var omaBuf = null;
var omaSource = null;
var parkStop = null;
var parkGain = null;
async function preloadSounds() {
	const ac = audio();
	if (omaBuf) return;
	try {
		const arr = await (await fetch("/assets/oma-stricknase.mp3")).arrayBuffer();
		omaBuf = await ac.decodeAudioData(arr.slice(0));
	} catch {
		omaBuf = null;
	}
}
function playOmaLine() {
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
	const u = new SpeechSynthesisUtterance("Die letzte, die unvorsichtig in meine Stricknadeln gegriffen hat, strickt jetzt mit der Nase.");
	u.lang = "de-DE";
	u.rate = .86;
	u.pitch = 1.18;
	u.volume = 1;
	window.speechSynthesis.speak(u);
}
function cancelOmaSpeech() {
	if (omaSource) {
		try {
			omaSource.stop();
		} catch {}
		omaSource = null;
	}
	if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}
function pinkBuffer(seconds) {
	const ac = audio();
	const n = Math.max(1, Math.floor(ac.sampleRate * seconds));
	const buf = ac.createBuffer(1, n, ac.sampleRate);
	const data = buf.getChannelData(0);
	let b0 = 0;
	let b1 = 0;
	let b2 = 0;
	for (let i = 0; i < n; i++) {
		const w = Math.random() * 2 - 1;
		b0 = .99886 * b0 + w * .0555179;
		b1 = .99332 * b1 + w * .0750759;
		b2 = .969 * b2 + w * .153852;
		data[i] = (b0 + b1 + b2 + w * .25) * .18;
	}
	return buf;
}
function parkBird() {
	if (!unlocked || muted) return;
	const base = 2200 + Math.random() * 1400;
	beep(base, "sine", .11, .035);
	setTimeout(() => beep(base * (.72 + Math.random() * .12), "sine", .14, .028), 90);
	if (Math.random() < .4) setTimeout(() => beep(base * 1.08, "triangle", .08, .02), 220);
}
function startParkAmbience() {
	stopParkAmbience();
	const ac = audio();
	if (!music) return;
	const g = ac.createGain();
	g.gain.value = 0;
	g.connect(music);
	g.gain.linearRampToValueAtTime(1, ac.currentTime + .7);
	parkGain = g;
	const windSrc = ac.createBufferSource();
	windSrc.buffer = pinkBuffer(7.5);
	windSrc.loop = true;
	const windFilter = ac.createBiquadFilter();
	windFilter.type = "bandpass";
	windFilter.frequency.value = 620;
	windFilter.Q.value = .55;
	const windGain = ac.createGain();
	windGain.gain.value = .14;
	const lfo = ac.createOscillator();
	const lfoG = ac.createGain();
	lfo.type = "sine";
	lfo.frequency.value = .11;
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
	leafGain.gain.value = .025;
	leafSrc.connect(leafHp);
	leafHp.connect(leafGain);
	leafGain.connect(g);
	leafSrc.start();
	const birdId = window.setInterval(() => {
		if (Math.random() < .72) parkBird();
	}, 2800);
	window.setTimeout(parkBird, 400);
	parkStop = () => {
		window.clearInterval(birdId);
		try {
			windSrc.stop();
			lfo.stop();
			leafSrc.stop();
		} catch {}
		try {
			g.disconnect();
		} catch {}
		if (parkGain === g) parkGain = null;
	};
}
function setParkPaused(paused) {
	if (!parkGain) return;
	const ac = audio();
	parkGain.gain.setTargetAtTime(paused ? .18 : 1, ac.currentTime, .12);
}
function stopParkAmbience() {
	if (parkStop) {
		parkStop();
		parkStop = null;
	}
	parkGain = null;
}
var BOARD_KEY = "bankgeheimnis-board-v1";
var LEGACY_KEY = "bankgeheimnis-hs-v1";
var BOARD_SIZE = 10;
var SAVE_VERSION = 1;
function normalizeName(raw) {
	return raw.replace(/\s+/g, " ").trim().slice(0, 16) || "Anonym";
}
function loadBoard() {
	try {
		const raw = localStorage.getItem(BOARD_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return (Array.isArray(parsed?.entries) ? parsed.entries : []).filter((e) => e && typeof e.score === "number" && typeof e.name === "string").sort((a, b) => b.score - a.score || a.at - b.at).slice(0, BOARD_SIZE);
		}
		const legacy = Number(localStorage.getItem(LEGACY_KEY) || 0) || 0;
		if (legacy > 0) {
			const migrated = [{
				name: "Rekord",
				score: legacy,
				at: Date.now()
			}];
			persist(migrated);
			return migrated;
		}
	} catch {}
	return [];
}
function persist(entries) {
	const save = {
		version: SAVE_VERSION,
		entries
	};
	try {
		localStorage.setItem(BOARD_KEY, JSON.stringify(save));
		const best = entries[0]?.score ?? 0;
		localStorage.setItem(LEGACY_KEY, String(best));
	} catch {}
}
function topScore() {
	return loadBoard()[0]?.score ?? 0;
}
function qualifies(score) {
	if (score <= 0) return false;
	const board = loadBoard();
	if (board.length < BOARD_SIZE) return true;
	return score > board[board.length - 1].score;
}
function submitScore(name, score) {
	if (score <= 0) return loadBoard();
	const entries = loadBoard();
	entries.push({
		name: normalizeName(name),
		score,
		at: Date.now()
	});
	entries.sort((a, b) => b.score - a.score || a.at - b.at);
	const next = entries.slice(0, BOARD_SIZE);
	persist(next);
	return next;
}
var WORLD_W = 1600;
var FIRE_CD = .26;
var COMBO_WINDOW = 1.05;
var MAX_ALIVE = 9;
var OMA_KEEP_X = 560;
var LANES = [
	{
		y: 532,
		scale: .52,
		z: .18,
		pts: 35,
		speed: 38
	},
	{
		y: 586,
		scale: .72,
		z: .82,
		pts: 22,
		speed: 58
	},
	{
		y: 642,
		scale: .94,
		z: 1.52,
		pts: 14,
		speed: 84
	},
	{
		y: 698,
		scale: 1.16,
		z: 2.38,
		pts: 8,
		speed: 108
	}
];
var TREES = [
	{
		x: 188,
		y: 578,
		z: .58,
		trunkW: 58,
		scale: .72,
		facing: 1
	},
	{
		x: 412,
		y: 552,
		z: .32,
		trunkW: 40,
		scale: .56,
		facing: -1
	},
	{
		x: 798,
		y: 568,
		z: .5,
		trunkW: 64,
		scale: .8,
		facing: -1
	},
	{
		x: 1128,
		y: 560,
		z: .4,
		trunkW: 44,
		scale: .62,
		facing: 1
	},
	{
		x: 1422,
		y: 574,
		z: .54,
		trunkW: 54,
		scale: .7,
		facing: -1
	}
];
var BUSHES = [
	{
		x: 255,
		y: 628,
		z: 1.2,
		scale: .72,
		w: 110,
		h: 88,
		facing: 1
	},
	{
		x: 365,
		y: 668,
		z: 1.74,
		scale: .9,
		w: 140,
		h: 108,
		facing: 1
	},
	{
		x: 575,
		y: 708,
		z: 2.18,
		scale: 1.08,
		w: 168,
		h: 124,
		facing: -1
	},
	{
		x: 995,
		y: 678,
		z: 1.9,
		scale: .96,
		w: 148,
		h: 112,
		facing: 1
	},
	{
		x: 1238,
		y: 658,
		z: 1.64,
		scale: .84,
		w: 132,
		h: 102,
		facing: -1
	},
	{
		x: 1492,
		y: 698,
		z: 2.1,
		scale: .94,
		w: 144,
		h: 110,
		facing: -1
	}
];
var ASSET_KEYS = [
	"park-bg",
	"foliage",
	"oma",
	"oma-recoil",
	"bahndidos",
	"logo",
	...[
		1,
		2,
		3,
		4
	].flatMap((n) => [
		`talahon-walk-${n}`,
		`talahon-walk-b-${n}`,
		`talahon-run-${n}`,
		`talahon-hit-${n}`,
		`muzzle-${n}`,
		`impact-${n}`
	])
];
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(src));
		img.src = src;
	});
}
function rand(a, b) {
	return a + Math.random() * (b - a);
}
function pick(arr) {
	return arr[Math.random() * arr.length | 0];
}
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function emptyHud() {
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
		ready: false
	};
}
var GameEngine = class {
	canvas;
	ctx;
	images = /* @__PURE__ */ new Map();
	mode = "title";
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
	targets = [];
	particles = [];
	floaters = [];
	holes = [];
	flashes = [];
	spawnAcc = 0;
	rockerT = 12;
	hudAcc = 0;
	id = 1;
	last = 0;
	raf = 0;
	reduced = false;
	onHud;
	destroyed = false;
	pointerDown = false;
	peekBusy = /* @__PURE__ */ new Set();
	bushBusy = /* @__PURE__ */ new Set();
	constructor(canvas, onHud) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.onHud = onHud;
		this.highScore = topScore();
		this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.bind();
		this.resize();
		this.boot();
	}
	hud() {
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
			ready: this.ready
		};
	}
	emit() {
		this.onHud(this.hud());
	}
	async boot() {
		await Promise.all(ASSET_KEYS.map(async (key) => {
			try {
				const img = await loadImage(`/assets/${key}.${key === "park-bg" ? "jpg" : "png"}`);
				this.images.set(key, img);
			} catch {}
		}));
		await preloadSounds();
		this.ready = true;
		this.emit();
		this.loop(performance.now());
	}
	img(key) {
		return this.images.get(key) ?? null;
	}
	onResize = () => this.resize();
	onPointerMove = (e) => {
		const p = this.toLocal(e);
		this.aimX = p.x;
		this.aimY = p.y;
	};
	onPointerDown = (e) => {
		e.preventDefault();
		unlockAudio();
		const p = this.toLocal(e);
		this.aimX = p.x;
		this.aimY = p.y;
		this.pointerDown = true;
		if (this.mode === "playing") this.shoot();
	};
	onPointerUp = () => {
		this.pointerDown = false;
	};
	onKey = (e) => {
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
	onVis = () => {
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
	toLocal(e) {
		const r = this.canvas.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width * WORLD_W,
			y: (e.clientY - r.top) / r.height * 900
		};
	}
	resize() {
		const parent = this.canvas.parentElement;
		if (!parent) return;
		const fit = Math.min(parent.clientWidth / WORLD_W, parent.clientHeight / 900);
		const w = Math.max(1, WORLD_W * fit);
		const h = Math.max(1, 900 * fit);
		this.canvas.style.width = `${w}px`;
		this.canvas.style.height = `${h}px`;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		this.canvas.width = Math.floor(WORLD_W * dpr);
		this.canvas.height = Math.floor(900 * dpr);
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
		this.spawnAcc = .5;
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
	baseTarget() {
		return {
			variant: Math.random() < .5 ? "a" : "b",
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
			hide: -1
		};
	}
	spawnWalker(lane, running, x) {
		if (this.aliveCount() >= MAX_ALIVE) return;
		const L = LANES[lane ?? (Math.random() < .34 ? 0 : Math.random() < .5 ? 1 : Math.random() < .58 ? 2 : 3)];
		const run = running ?? Math.random() < .38;
		const fromRight = L.y >= 620 || Math.random() >= .5;
		const speed = L.speed * (run ? 2.2 : 1) * rand(.88, 1.18);
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
			phase: "move"
		});
	}
	spawnPeeker() {
		if (this.aliveCount() >= MAX_ALIVE) return;
		const free = TREES.map((_, i) => i).filter((i) => !this.peekBusy.has(i) && TREES[i].x >= OMA_KEEP_X);
		if (!free.length) return;
		const idx = pick(free);
		const tree = TREES[idx];
		this.peekBusy.add(idx);
		this.targets.push({
			...this.baseTarget(),
			id: this.id++,
			act: "peek",
			x: tree.x,
			y: tree.y,
			vx: 0,
			z: tree.z + .04,
			facing: tree.facing,
			points: tree.scale < .42 ? 32 : 26,
			scale: tree.scale,
			phase: "in",
			phaseT: 0,
			reveal: 0,
			hide: idx
		});
	}
	spawnBush() {
		if (this.aliveCount() >= MAX_ALIVE) return;
		const free = BUSHES.map((_, i) => i).filter((i) => !this.bushBusy.has(i) && BUSHES[i].x >= OMA_KEEP_X);
		if (!free.length) return;
		const idx = pick(free);
		const bush = BUSHES[idx];
		this.bushBusy.add(idx);
		this.targets.push({
			...this.baseTarget(),
			id: this.id++,
			act: "bush",
			x: bush.x + bush.facing * 10,
			y: bush.y,
			vx: 0,
			z: bush.z + .06,
			facing: bush.facing,
			points: bush.scale < .8 ? 22 : 16,
			scale: bush.scale,
			phase: "in",
			phaseT: 0,
			reveal: 0,
			hide: idx
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
			scale: .92,
			phase: "move"
		});
		playRocker();
	}
	freeHide(t) {
		if (t.act === "peek" && t.hide >= 0) this.peekBusy.delete(t.hide);
		if (t.act === "bush" && t.hide >= 0) this.bushBusy.delete(t.hide);
		t.hide = -1;
	}
	dashOut(t, run = true) {
		let dir = t.facing;
		if (t.x < 600) dir = 1;
		this.freeHide(t);
		t.act = run ? "run" : "walk";
		t.phase = "move";
		t.phaseT = 0;
		t.reveal = 1;
		t.facing = dir;
		t.vx = dir * ((run ? 210 : 92) * (.55 + t.scale));
		t.points = run ? t.points + 4 : Math.max(8, t.points - 6);
	}
	placeBush(t) {
		if (t.hide < 0) return;
		const bush = BUSHES[t.hide];
		const dh = t.dh || 335 * t.scale;
		const shown = clamp(t.reveal, .12, .72);
		t.y = bush.y - bush.h + 18 + dh * (1 - shown);
	}
	shoot() {
		if (this.mode !== "playing" || this.fireCd > 0) return;
		this.fireCd = FIRE_CD;
		this.recoil = .12;
		this.shots++;
		playShot();
		if (!this.reduced) this.trauma = Math.min(1, this.trauma + .28);
		const oma = this.omaRect();
		this.flashes.push({
			x: oma.mx,
			y: oma.my,
			t: .12,
			kind: "muzzle"
		});
		let hit = null;
		let z = -1;
		let dist = Infinity;
		for (const t of this.targets) {
			if (t.state !== "alive" || t.act === "bush" && t.reveal < .2 || t.act === "peek" && t.reveal < .18 || t.act === "peek" && t.phase === "out" || !this.hitTest(t, this.aimX, this.aimY)) continue;
			const cx = t.x;
			const cy = t.y - t.dh * .45;
			const d = (cx - this.aimX) ** 2 + (cy - this.aimY) ** 2;
			if (t.z > z + .01 || Math.abs(t.z - z) < .01 && d < dist) {
				hit = t;
				z = t.z;
				dist = d;
			}
		}
		if (hit) this.kill(hit);
		else {
			playMiss();
			this.combo = 0;
			this.holes.push({
				x: this.aimX,
				y: this.aimY,
				r: rand(4, 7),
				a: 1
			});
			if (this.holes.length > 48) this.holes.shift();
			this.burst(this.aimX, this.aimY, 5, "#cfc4ae", 40);
		}
		this.emit();
	}
	occludesPoint(t, x, y) {
		for (const tree of TREES) {
			if (tree.z <= t.z + .05) continue;
			if (x >= tree.x - tree.trunkW / 2 && x <= tree.x + tree.trunkW / 2 && y <= tree.y && y >= tree.y - 280) return true;
		}
		for (const bush of BUSHES) {
			if (bush.z <= t.z + .05) continue;
			if (x >= bush.x - bush.w / 2 && x <= bush.x + bush.w / 2 && y <= bush.y && y >= bush.y - bush.h) return true;
		}
		return false;
	}
	hitTest(t, x, y) {
		if ((t.act === "walk" || t.act === "run") && this.occludesPoint(t, x, y)) return false;
		const w = t.dw || 80;
		const h = t.dh || 80;
		let left = t.x - w * .38;
		let right = t.x + w * .38;
		let top = t.y - h * .92;
		let bottom = t.y - h * .06;
		if (t.act === "peek" && t.hide >= 0) {
			const tree = TREES[t.hide];
			const r = Math.max(.2, t.reveal);
			if (t.facing > 0) {
				left = tree.x;
				right = t.x + w * .42 * r;
			} else {
				left = t.x - w * .42 * r;
				right = tree.x;
			}
			top = t.y - h * .9;
			bottom = t.y - h * .1;
		}
		if (t.act === "bush") {
			top = t.y - h;
			bottom = t.y - h * (1 - Math.max(.15, t.reveal));
			left = t.x - w * .32;
			right = t.x + w * .32;
		}
		return x >= left && x <= right && y >= top && y <= bottom;
	}
	kill(t) {
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
			this.trauma = Math.min(1, this.trauma + (t.act === "rocker" ? .7 : .38));
			this.hitstop = t.act === "rocker" ? .09 : .045;
		}
		this.flashes.push({
			x: t.x,
			y: t.y - t.dh * .5,
			t: .18,
			kind: "impact"
		});
		this.burst(t.x, t.y - t.dh * .45, t.act === "rocker" ? 28 : 16, "#d4a84b", 160);
		this.burst(t.x, t.y - t.dh * .45, 8, "#f3ead8", 90);
		this.floaters.push({
			x: t.x,
			y: t.y - t.dh * .78,
			text: mult > 1 ? `${pts}  ×${mult}` : `+${pts}`,
			life: 1.35,
			max: 1.35,
			color: "#f3ead8",
			size: t.act === "rocker" ? 110 : 92
		});
	}
	burst(x, y, n, color, speed) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = rand(speed * .3, speed);
			this.particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s - 40,
				life: rand(.35, .7),
				max: .7,
				size: rand(2, 5),
				color,
				rot: rand(0, 6),
				vr: rand(-8, 8)
			});
		}
	}
	omaRect() {
		const img = this.img(this.recoil > .02 ? "oma-recoil" : "oma");
		const w = img ? 455 * (img.width / img.height) : 440;
		return {
			x: 28,
			y: 467,
			w,
			h: 455,
			mx: 28 + w * .8,
			my: 644.45
		};
	}
	loop = (now) => {
		if (this.destroyed) return;
		this.raf = requestAnimationFrame(this.loop);
		const dt = this.last ? (now - this.last) / 1e3 : .016;
		this.last = now;
		this.update(Math.min(dt, .1));
		this.draw();
	};
	update(dt) {
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
		if (this.hudAcc > .12) {
			this.hudAcc = 0;
			this.emit();
		}
		const progress = 1 - this.timeLeft / 90;
		const spawnWait = 1.05 - progress * .62;
		this.spawnAcc -= dt;
		if (this.spawnAcc <= 0) {
			this.spawnAcc = spawnWait * rand(.7, 1.15);
			const n = progress > .5 && Math.random() < .55 ? 2 : 1;
			for (let i = 0; i < n; i++) {
				const r = Math.random();
				if (r < .5) this.spawnBush();
				else if (r < .72) this.spawnPeeker();
				else if (r < .9) this.spawnWalker(void 0, false);
				else this.spawnWalker(void 0, true);
			}
		}
		this.rockerT -= dt;
		if (this.rockerT <= 0) {
			this.rockerT = rand(14, 24) - progress * 4;
			this.spawnRocker();
		}
		for (const t of this.targets) {
			t.frameT += dt;
			const fps = t.state === "falling" ? 10 : t.act === "run" ? 12 : t.act === "walk" ? 8 : t.act === "peek" ? 4 : t.act === "bush" ? 6 : 0;
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
					t.reveal = clamp(t.phaseT / .7, 0, 1);
					if (t.phaseT > .7) {
						t.phase = "hold";
						t.phaseT = -rand(.85, 2.1);
						t.reveal = 1;
					}
				} else if (t.phase === "hold") {
					t.reveal = 1;
					if (t.phaseT > 0) {
						if (Math.random() < .48) this.dashOut(t, Math.random() < .62);
						else {
							t.phase = "out";
							t.phaseT = 0;
						}
					}
				} else if (t.phase === "out") {
					t.reveal = 1 - clamp(t.phaseT / .48, 0, 1);
					if (t.phaseT > .52) t.x = -999;
				}
				if (tree && t.x !== -999) {
					const n = 210 * t.scale;
					t.x = tree.x + t.facing * (tree.trunkW * .16 + n * .36 * t.reveal);
					t.y = tree.y;
				}
			} else if (t.act === "bush") {
				if (t.phase === "in") {
					t.reveal = clamp(t.phaseT / .7, 0, .5);
					if (t.phaseT > .7) {
						t.phase = "hold";
						t.phaseT = -rand(1.15, 2.5);
					}
				} else if (t.phase === "hold") {
					t.reveal = .5 + Math.sin(t.phaseT * 2.2) * .04;
					if (t.phaseT > 0) {
						if (Math.random() < .16) this.dashOut(t, Math.random() < .45);
						else {
							t.phase = "out";
							t.phaseT = 0;
						}
					}
				} else if (t.phase === "out") {
					t.reveal = .5 * (1 - clamp(t.phaseT / .48, 0, 1));
					if (t.phaseT > .52) t.x = -999;
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
	spriteFor(t) {
		if (t.act === "rocker") return this.img("bahndidos");
		if (t.state === "falling") return this.img(`talahon-hit-${t.frame % 4 + 1}`);
		if (t.act === "run") return this.img(`talahon-run-${t.frame % 4 + 1}`);
		const base = t.variant === "b" ? "talahon-walk-b" : "talahon-walk";
		return this.img(`${base}-${t.frame % 4 + 1}`);
	}
	draw() {
		const ctx = this.ctx;
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.clearRect(0, 0, WORLD_W, 900);
		const shake = this.reduced ? 0 : this.trauma * this.trauma;
		const ox = shake ? (Math.random() * 2 - 1) * 14 * shake : 0;
		const oy = shake ? (Math.random() * 2 - 1) * 10 * shake : 0;
		ctx.translate(ox, oy);
		const bg = this.img("park-bg");
		if (bg) ctx.drawImage(bg, 0, 0, WORLD_W, 900);
		else {
			ctx.fillStyle = "#6ea0c8";
			ctx.fillRect(0, 0, WORLD_W, 900);
			ctx.fillStyle = "#3d6b3a";
			ctx.fillRect(0, 405, WORLD_W, 900);
		}
		for (const hole of this.holes) {
			ctx.fillStyle = `rgba(10,10,10,${.55 * hole.a})`;
			ctx.beginPath();
			ctx.ellipse(hole.x, hole.y, hole.r, hole.r * .75, 0, 0, Math.PI * 2);
			ctx.fill();
		}
		const sorted = this.targets.slice().sort((a, b) => a.z - b.z);
		for (const t of sorted) this.drawTarget(t);
		const foliage = this.img("foliage");
		if (foliage) ctx.drawImage(foliage, 0, 698, WORLD_W, 210);
		const oma = this.omaRect();
		const omaImg = this.img(this.recoil > .02 ? "oma-recoil" : "oma");
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
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .6);
			ctx.restore();
		}
		for (const f of this.flashes) {
			const key = f.kind === "muzzle" ? `muzzle-${clamp(4 - Math.ceil(f.t * 20), 1, 4)}` : `impact-${clamp(4 - Math.ceil(f.t * 16), 1, 4)}`;
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
			ctx.globalAlpha = clamp(f.life / f.max * 1.35, 0, 1);
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
	clipOccluders(ctx, t) {
		const w = t.dw || 80;
		const left = t.x - w * .5;
		const right = t.x + w * .5;
		let box = null;
		let z = Infinity;
		for (const tree of TREES) {
			if (tree.z <= t.z + .05) continue;
			const tx = tree.x - tree.trunkW / 2;
			if (right < tx || left > tx + tree.trunkW) continue;
			if (tree.z < z) {
				z = tree.z;
				box = {
					x: tx,
					y: tree.y - 300,
					w: tree.trunkW,
					h: 320
				};
			}
		}
		for (const bush of BUSHES) {
			if (bush.z <= t.z + .05) continue;
			const bx = bush.x - bush.w / 2;
			if (right < bx || left > bx + bush.w) continue;
			if (bush.z < z) {
				z = bush.z;
				box = {
					x: bx,
					y: bush.y - bush.h,
					w: bush.w,
					h: bush.h
				};
			}
		}
		if (box) {
			ctx.beginPath();
			ctx.rect(-40, -40, 1680, 980);
			ctx.rect(box.x, box.y, box.w, box.h);
			ctx.clip("evenodd");
		}
	}
	drawTarget(t) {
		const sprite = this.spriteFor(t);
		const ctx = this.ctx;
		let w = 140 * t.scale;
		let h = 180 * t.scale;
		if (sprite) {
			const ratio = sprite.width / sprite.height;
			h = (t.act === "rocker" ? 430 : t.act === "peek" ? 340 : t.act === "bush" ? 335 : 320) * t.scale;
			w = h * ratio;
		}
		t.dw = w;
		t.dh = h;
		if (t.act === "bush" && t.state === "alive") this.placeBush(t);
		ctx.save();
		if (t.act === "walk" || t.act === "run" || t.state === "falling") this.clipOccluders(ctx, t);
		if (t.act === "peek" && t.state === "alive" && t.hide >= 0) {
			const tree = TREES[t.hide];
			ctx.beginPath();
			if (t.facing > 0) ctx.rect(tree.x - 2, 0, WORLD_W, 900);
			else ctx.rect(0, 0, tree.x + 2, 900);
			ctx.clip();
		}
		ctx.translate(t.x, t.y);
		ctx.rotate(t.rot);
		if (t.facing < 0) ctx.scale(-1, 1);
		if (t.act === "bush" && t.state === "alive" && t.reveal < .98) {
			const r = clamp(t.reveal, .12, 1);
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
		const kick = this.fireCd > .14 ? 4 : 0;
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
};
var primaryBtn = "h-12 rounded-md bg-paper px-6 font-display text-2xl tracking-wide text-ink transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]";
var ghostBtn = "h-11 rounded-md border border-line px-6 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-3 hover:text-paper";
function GameScreen() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [hud, setHud] = (0, import_react.useState)(emptyHud());
	const [omaLine, setOmaLine] = (0, import_react.useState)(false);
	const [board, setBoard] = (0, import_react.useState)(() => loadBoard());
	const [name, setName] = (0, import_react.useState)("");
	const [named, setNamed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new GameEngine(canvas, setHud);
		engineRef.current = engine;
		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (hud.mode !== "playing") {
			setOmaLine(false);
			return;
		}
		setOmaLine(true);
		const t = window.setTimeout(() => setOmaLine(false), 7e3);
		return () => window.clearTimeout(t);
	}, [hud.mode]);
	(0, import_react.useEffect)(() => {
		if (hud.mode === "results") {
			setNamed(!qualifies(hud.score));
			setName("");
			setBoard(loadBoard());
		}
		if (hud.mode === "title") setBoard(loadBoard());
	}, [hud.mode, hud.score]);
	const engine = engineRef.current;
	const playing = hud.mode === "playing";
	const accuracy = hud.shots ? Math.round(hud.hits / hud.shots * 100) : 0;
	const min = Math.floor(hud.timeLeft / 60);
	const sec = String(Math.floor(hud.timeLeft % 60)).padStart(2, "0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-ink text-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex h-full w-full max-h-[100dvh] max-w-[100vw] items-center justify-center",
			style: { touchAction: "none" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "block max-h-full max-w-full",
					style: {
						cursor: playing ? "none" : "default",
						touchAction: "none"
					}
				}),
				hud.mode === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 flex items-center justify-center bg-ink/80 px-4 py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex max-h-full w-full max-w-lg flex-col items-center gap-5 overflow-y-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/assets/logo.png",
								alt: "Bankgeheimnis im Park",
								className: "h-auto w-[min(72vw,280px)] select-none",
								draggable: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-sm text-center text-sm leading-relaxed text-paper-dim",
								children: "90 Sekunden. Die Oma holt die Parabellum unter dem Strickzeug vor. Talahons gucken aus den Büschen und hinter Bäumen, manche laufen durch den Park."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "w-full max-w-sm space-y-1.5 text-sm text-paper-dim",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "Nah, groß",
										value: "8 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "Weit, klein",
										value: "35 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "Hinterm Baum / im Busch",
										value: "18–28 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "Bahndidos auf dem Roller",
										value: "200 Pkt"
									})
								]
							}),
							board.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "w-full max-w-sm space-y-1 text-sm text-paper-dim",
								children: board.slice(0, 5).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "truncate",
										children: [
											i + 1,
											". ",
											row.name
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium tabular-nums text-paper",
										children: row.score
									})]
								}, `${row.at}-${row.name}`))
							}),
							hud.highScore > 0 && board.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-2xl tracking-wide text-paper",
								children: ["Highscore ", hud.highScore]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !hud.ready,
								onClick: () => {
									unlockAudio();
									engine?.start();
								},
								className: "h-12 min-w-44 rounded-lg bg-paper px-8 font-display text-2xl tracking-wide text-ink transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50",
								children: hud.ready ? "Spielen" : "Laden…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Klicken zum Zielen · Esc Pause · M Stumm"
							})
						]
					})
				}),
				(hud.mode === "playing" || hud.mode === "paused") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 pt-[max(12px,env(safe-area-inset-top))] sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudChip, {
								label: "Punkte",
								value: String(hud.score)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudChip, {
								label: "Zeit",
								value: `${min}:${sec}`,
								large: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudChip, {
								label: "Combo",
								value: String(hud.combo)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-3 bottom-[max(12px,env(safe-area-inset-bottom))] flex gap-2 sm:right-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: hud.muted ? "Ton an" : "Stumm",
							onClick: () => engine?.toggleMute(),
							children: hud.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: hud.mode === "paused" ? "Weiter" : "Pause",
							onClick: () => hud.mode === "paused" ? engine?.resume() : engine?.pause(),
							children: hud.mode === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
						})]
					}),
					omaLine && playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute bottom-[max(4.75rem,calc(env(safe-area-inset-bottom)+3.5rem))] left-3 max-w-[min(78vw,22rem)] sm:bottom-10 sm:left-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl rounded-bl-sm border border-line bg-ink/80 px-4 py-3 backdrop-blur-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase",
								children: "Oma"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-snug text-paper sm:text-base",
								children: "„Die letzte, die unvorsichtig in meine Stricknadeln gegriffen hat, strickt jetzt mit der Nase.“"
							})]
						})
					})
				] }),
				hud.mode === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-5xl tracking-wide",
					children: "Pause"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: primaryBtn,
						onClick: () => engine?.resume(),
						children: "Weiter"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: ghostBtn,
						onClick: () => engine?.toTitle(),
						children: "Menü"
					})]
				})] }),
				hud.mode === "results" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-5xl tracking-wide",
						children: "Runde vorbei"
					}),
					hud.isNewHigh && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm font-medium text-paper",
						children: "Neuer Highscore"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-display text-6xl tabular-nums tracking-wide",
						children: hud.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-2 text-sm text-paper-dim",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Treffer" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "text-right tabular-nums text-paper",
								children: [
									hud.hits,
									" / ",
									hud.shots
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Genauigkeit" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "text-right tabular-nums text-paper",
								children: [accuracy, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Beste Combo" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-right tabular-nums text-paper",
								children: hud.bestCombo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Highscore" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-right tabular-nums text-paper",
								children: Math.max(hud.highScore, board[0]?.score ?? 0)
							})
						]
					}),
					!named && qualifies(hud.score) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-5 flex w-full max-w-xs flex-col gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							setBoard(submitScore(name, hud.score));
							setNamed(true);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase",
								children: "Name für die Bestenliste"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								autoFocus: true,
								maxLength: 16,
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "Dein Name",
								className: "h-11 rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-muted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: primaryBtn,
								children: "Eintragen"
							})
						]
					}) : board.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-5 w-full max-w-xs space-y-1 text-sm text-paper-dim",
						children: board.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `flex justify-between gap-3 ${row.score === hud.score && row.name === (name.trim() || "Anonym") ? "text-paper" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: [
									i + 1,
									". ",
									row.name
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-paper",
								children: row.score
							})]
						}, `${row.at}-${row.name}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: primaryBtn,
							onClick: () => {
								if (!named && qualifies(hud.score)) submitScore(name, hud.score);
								unlockAudio();
								engine?.start();
							},
							children: "Nochmal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: ghostBtn,
							onClick: () => {
								if (!named && qualifies(hud.score)) submitScore(name, hud.score);
								engine?.toTitle();
							},
							children: "Menü"
						})]
					})
				] })
			]
		})
	});
}
function ScoreRow({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex justify-between gap-4 border-b border-line py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-paper",
			children: value
		})]
	});
}
function Modal({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-ink/70 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[min(92dvh,44rem)] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-ink-2 px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
			children
		})
	});
}
function HudChip({ label, value, large }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none rounded-md border border-line bg-ink/55 px-3 py-2 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-medium tracking-[0.14em] text-paper-dim uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-display tabular-nums tracking-wide ${large ? "text-4xl" : "text-3xl"}`,
			children: value
		})]
	});
}
function IconBtn({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "flex size-11 items-center justify-center rounded-md border border-line bg-ink/70 text-paper backdrop-blur-sm transition-colors hover:bg-ink-3",
		children
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameScreen, {});
}
//#endregion
export { Home as component };
