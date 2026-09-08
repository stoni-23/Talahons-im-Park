import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Smartphone, c as Pause, l as LogOut, n as Volume2, o as Share2, r as User, s as Play, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-irFl9g0-.js
var routes_irFl9g0__exports = /* @__PURE__ */ __exportAll({
	C: () => stopParkAmbience,
	S: () => stopOmaKommando,
	T: () => unlockAudio,
	_: () => resumeAudio,
	a: () => playMiss,
	b: () => startParkAmbience,
	c: () => playOmaLine,
	component: () => Home,
	d: () => playRoundEnd,
	f: () => playShot,
	g: () => preloadSounds,
	h: () => playVoice,
	i: () => playHit,
	l: () => playOpaSpawn,
	m: () => playTalahonHitVoice,
	n: () => isMuted,
	o: () => playOmaHitVoice,
	p: () => playTalahinIntro,
	r: () => onGameStartAudio,
	s: () => playOmaKommando,
	t: () => cancelOmaSpeech,
	u: () => playRocker,
	v: () => setMuted,
	w: () => tickChirps,
	x: () => stopAllVoices,
	y: () => setParkPaused
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var muted = false;
var audioCtx = null;
var bgmAudio = null;
var activeSounds = [];
var talahonHitCount = 0;
var omaHitCount = 0;
var midGameTimer = null;
var midGamePlayed = false;
var soundPool = {};
function getCtx() {
	if (!audioCtx) {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (Ctx) audioCtx = new Ctx();
	}
	if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
	return audioCtx;
}
function regAudio(name, src, poolSize = 2, loop = false) {
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
function playVoice(src, vol = 1) {
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
function stopAllVoices() {
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
async function preloadSounds() {
	regAudio("bgm", "/sounds/Bgm_main.mp3", 1, true);
	regAudio("talahin", "/talahin_intro.wav", 2, false);
	regAudio("rocker", "/rocker_intro.wav", 2, false);
	regAudio("oma_kommando", "/oma_kommando.wav", 2, false);
}
function startParkAmbience() {
	if (muted) return;
	if (soundPool["bgm"] && soundPool["bgm"][0]) {
		bgmAudio = soundPool["bgm"][0];
		bgmAudio.volume = .45;
		bgmAudio.playbackRate = 1;
		bgmAudio.play().catch(() => {});
	}
}
function stopParkAmbience() {
	stopAllVoices();
	if (bgmAudio) {
		bgmAudio.pause();
		bgmAudio.currentTime = 0;
		bgmAudio.playbackRate = 1;
	}
}
function setParkPaused(paused) {
	if (paused) {
		stopAllVoices();
		if (bgmAudio) bgmAudio.pause();
	} else if (bgmAudio && !muted) bgmAudio.play().catch(() => {});
}
function playShot() {
	if (muted) return;
	const ctx = getCtx();
	if (!ctx) return;
	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const now = ctx.currentTime;
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(600, now);
		osc.frequency.exponentialRampToValueAtTime(40, now + .08);
		gain.gain.setValueAtTime(.35, now);
		gain.gain.exponentialRampToValueAtTime(.001, now + .08);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + .08);
	} catch {}
}
function playHit(combo = 1) {
	if (muted) return;
	const ctx = getCtx();
	if (!ctx) return;
	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const now = ctx.currentTime;
		const baseFreq = 260 * Math.min(1 + (combo - 1) * .15, 2.5);
		osc.type = "triangle";
		osc.frequency.setValueAtTime(baseFreq, now);
		osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + .1);
		gain.gain.setValueAtTime(.45, now);
		gain.gain.exponentialRampToValueAtTime(.001, now + .12);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + .12);
	} catch {}
}
function playMiss() {}
function onGameStartAudio() {
	stopAllVoices();
	talahonHitCount = 0;
	omaHitCount = 0;
	midGamePlayed = false;
	const delay = Math.floor(Math.random() * 20001) + 15e3;
	midGameTimer = setTimeout(() => {
		if (!midGamePlayed) {
			midGamePlayed = true;
			const list = ["/scharfe_sybille.wav", "/oma_guliguli.wav"];
			playVoice(list[Math.floor(Math.random() * list.length)]);
		}
	}, delay);
}
function playOpaSpawn() {
	playVoice("/opa_aus_dem_weg.wav");
}
function playRocker() {
	const rockerSounds = [
		"/rocker_brum.wav",
		"/rocker_powerbank.wav",
		"/rocker_intro.wav"
	];
	playVoice(rockerSounds[Math.floor(Math.random() * rockerSounds.length)], .9);
}
function playTalahonHitVoice() {
	talahonHitCount++;
	if (talahonHitCount % 16 === 0) playVoice("/walla_billah.wav", .55);
}
function playOmaHitVoice() {
	omaHitCount++;
	if (omaHitCount % 9 === 0) playVoice("/und_tschuess.wav");
}
function playRoundEnd() {
	if (midGameTimer) {
		clearTimeout(midGameTimer);
		midGameTimer = null;
	}
	playVoice("/oma_tschuessikofski.wav");
}
function playTalahinIntro() {
	if (muted || !soundPool["talahin"]) return;
	const pool = soundPool["talahin"];
	const a = pool.shift();
	pool.push(a);
	a.volume = .9;
	a.currentTime = 0;
	a.play().catch(() => {});
}
function playOmaKommando() {
	if (muted || !soundPool["oma_kommando"]) return;
	const pool = soundPool["oma_kommando"];
	const a = pool.shift();
	pool.push(a);
	a.volume = 1;
	a.currentTime = 0;
	a.play().catch(() => {});
	if (bgmAudio) bgmAudio.playbackRate = 1.3;
}
function stopOmaKommando() {
	if (bgmAudio) bgmAudio.playbackRate = 1;
}
function playOmaLine() {
	playVoice("/stricknase.mp3", 1);
}
function cancelOmaSpeech() {
	stopAllVoices();
}
function tickChirps(_dt) {}
function isMuted() {
	return muted;
}
function setMuted(m) {
	muted = m;
	if (bgmAudio) {
		if (m) bgmAudio.pause();
		else bgmAudio.play().catch(() => {});
	}
	if (m) stopAllVoices();
}
function resumeAudio() {
	getCtx();
}
function unlockAudio() {
	getCtx();
}
function getPlayerLevel(xp) {
	if (!xp || xp <= 0) return 1;
	return Math.max(1, Math.floor(Math.sqrt(xp / 2500)) + 1);
}
function getLevelProgress(xp) {
	const currentXp = Math.max(0, xp || 0);
	const level = getPlayerLevel(currentXp);
	const currentLevelBaseXp = Math.pow(level - 1, 2) * 2500;
	const nextLevelBaseXp = Math.pow(level, 2) * 2500;
	const needed = nextLevelBaseXp - currentLevelBaseXp;
	const progressInLevel = currentXp - currentLevelBaseXp;
	return {
		level,
		currentXp,
		currentLevelBaseXp,
		nextLevelBaseXp,
		progressInLevel,
		needed,
		percent: Math.min(100, Math.max(0, Math.floor(progressInLevel / needed * 100)))
	};
}
var ACTIVE_USER_KEY = "bankgeheimnis_active_user";
var USER_PREFIX = "bankgeheimnis_user_";
function getActiveUserName() {
	if (typeof window === "undefined") return "";
	return localStorage.getItem(ACTIVE_USER_KEY) || "";
}
function setActiveUserName(name) {
	if (typeof window === "undefined") return;
	localStorage.setItem(ACTIVE_USER_KEY, name.trim());
}
function loadProfile$1(name) {
	const currentName = name !== void 0 ? name.trim() : getActiveUserName();
	if (!currentName || typeof window === "undefined") return {
		name: "",
		highScore: 0,
		gamesPlayed: 0,
		totalHits: 0,
		totalXp: 0
	};
	const data = localStorage.getItem(USER_PREFIX + currentName.toLowerCase());
	if (!data) return {
		name: currentName,
		highScore: 0,
		gamesPlayed: 0,
		totalHits: 0,
		totalXp: 0
	};
	try {
		const parsed = JSON.parse(data);
		const bestScore = Math.max(0, Number(parsed.highScore) || 0);
		const rawXp = Number(parsed.totalXp) || 0;
		const resolvedXp = Math.max(0, rawXp);
		return {
			name: currentName,
			highScore: bestScore,
			gamesPlayed: Math.max(0, Number(parsed.gamesPlayed) || 0),
			totalHits: Math.max(0, Number(parsed.totalHits) || 0),
			totalXp: resolvedXp,
			coins: Number(parsed.coins) || 0,
			inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
			equipped: parsed.equipped && typeof parsed.equipped === "object" ? parsed.equipped : {},
			missions: Array.isArray(parsed.missions) ? parsed.missions : void 0,
			dailyReward: parsed.dailyReward && typeof parsed.dailyReward === "object" ? parsed.dailyReward : void 0
		};
	} catch {
		return {
			name: currentName,
			highScore: 0,
			gamesPlayed: 0,
			totalHits: 0,
			totalXp: 0
		};
	}
}
function saveProfile$1(profile) {
	if (typeof window === "undefined" || !profile.name.trim()) return;
	setActiveUserName(profile.name);
	const bestScore = Math.max(0, profile.highScore || 0);
	const resolvedXp = Math.max(0, profile.totalXp || 0);
	localStorage.setItem(USER_PREFIX + profile.name.trim().toLowerCase(), JSON.stringify({
		name: profile.name.trim(),
		missions: profile.missions,
		dailyReward: profile.dailyReward,
		highScore: bestScore,
		gamesPlayed: Math.max(0, profile.gamesPlayed || 0),
		totalHits: Math.max(0, profile.totalHits || 0),
		totalXp: resolvedXp,
		coins: typeof profile.coins === "number" ? profile.coins : 0,
		inventory: Array.isArray(profile.inventory) ? profile.inventory : [],
		equipped: profile.equipped && typeof profile.equipped === "object" ? profile.equipped : {}
	}));
}
var SUPABASE_URL = "https://lforuvtpskrnydlburpt.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
function headers(extra = {}) {
	return {
		apikey: SUPABASE_KEY,
		Authorization: `Bearer ${SUPABASE_KEY}`,
		...extra
	};
}
function loadBoard() {
	try {
		const raw = typeof window !== "undefined" ? localStorage.getItem("park_highscores") || localStorage.getItem("bankgeheimnis_board") : null;
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function saveBoardLocal(board) {
	try {
		if (typeof window !== "undefined") {
			localStorage.setItem("park_highscores", JSON.stringify(board));
			localStorage.setItem("bankgeheimnis_board", JSON.stringify(board));
		}
	} catch {}
}
function topScore() {
	return loadBoard()[0]?.score ?? 0;
}
function qualifies(score) {
	return score > 0;
}
async function fetchAccountStats(username) {
	const cleanName = String(username || "").trim();
	if (!cleanName) return null;
	try {
		const res = await fetch(`${SUPABASE_URL}/rest/v1/accounts?username=ilike.${encodeURIComponent(cleanName)}&select=stats`, { headers: headers() });
		if (!res.ok) return null;
		const rows = await res.json();
		if (Array.isArray(rows) && rows[0] && typeof rows[0].stats === "object" && rows[0].stats) return rows[0].stats;
		return null;
	} catch {
		return null;
	}
}
async function persistAccountStats(username, roundScoreOrStats, additionalStats = {}) {
	const cleanName = String(username || "").trim();
	if (!cleanName) return null;
	try {
		const prevStats = await fetchAccountStats(cleanName) || {
			totalXp: 0,
			highScore: 0,
			gamesPlayed: 0,
			totalHits: 0
		};
		let roundScore = 0;
		let extraHits = 0;
		let explicitXp = 0;
		let explicitHigh = 0;
		let explicitGames = 0;
		if (typeof roundScoreOrStats === "number") {
			roundScore = roundScoreOrStats;
			extraHits = additionalStats.totalHits || 0;
		} else if (typeof roundScoreOrStats === "object" && roundScoreOrStats !== null) {
			roundScore = Number(roundScoreOrStats.roundScore ?? roundScoreOrStats.score) || 0;
			extraHits = Number(roundScoreOrStats.roundHits ?? roundScoreOrStats.totalHits) || 0;
			explicitXp = Number(roundScoreOrStats.totalXp ?? roundScoreOrStats.total_xp) || 0;
			explicitHigh = Number(roundScoreOrStats.highScore) || 0;
			explicitGames = Number(roundScoreOrStats.gamesPlayed) || 0;
		}
		const prevXp = Number(prevStats.totalXp) || 0;
		const prevHits = Number(prevStats.totalHits) || 0;
		const prevGames = Number(prevStats.gamesPlayed) || 0;
		const prevHigh = Number(prevStats.highScore) || 0;
		const nextXp = explicitXp > 0 ? Math.max(prevXp, explicitXp) : roundScore > 0 ? prevXp + roundScore : Math.max(prevXp, Number(additionalStats.totalXp) || 0);
		const nextHits = extraHits > 0 ? prevHits + extraHits : Math.max(prevHits, Number(additionalStats.totalHits) || 0);
		const nextGames = explicitGames > 0 ? Math.max(prevGames, explicitGames) : roundScore > 0 ? prevGames + 1 : Math.max(prevGames, Number(additionalStats.gamesPlayed) || 0);
		const nextHigh = Math.max(prevHigh, roundScore, explicitHigh, Number(additionalStats.highScore) || 0);
		const updatedStats = {
			...prevStats,
			...additionalStats,
			...typeof roundScoreOrStats === "object" ? roundScoreOrStats : {},
			totalXp: nextXp,
			highScore: nextHigh,
			gamesPlayed: nextGames,
			totalHits: nextHits
		};
		const calculatedLevel = getPlayerLevel(updatedStats.totalXp);
		await fetch(`${SUPABASE_URL}/rest/v1/accounts?username=ilike.${encodeURIComponent(cleanName)}`, {
			method: "PATCH",
			headers: headers({
				"Content-Type": "application/json",
				Prefer: "return=minimal"
			}),
			body: JSON.stringify({ stats: updatedStats })
		});
		const existing = await (await fetch(`${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(cleanName)}&select=id,score`, { headers: headers() })).json().catch(() => []);
		if (Array.isArray(existing) && existing.length > 0) {
			const bestScore = Math.max(Number(existing[0].score) || 0, roundScore, nextHigh);
			await fetch(`${SUPABASE_URL}/rest/v1/highscores?id=eq.${existing[0].id}`, {
				method: "PATCH",
				headers: headers({
					"Content-Type": "application/json",
					Prefer: "return=minimal"
				}),
				body: JSON.stringify({
					score: bestScore,
					total_xp: updatedStats.totalXp,
					level: calculatedLevel
				})
			});
		} else await fetch(`${SUPABASE_URL}/rest/v1/highscores`, {
			method: "POST",
			headers: headers({
				"Content-Type": "application/json",
				Prefer: "return=minimal"
			}),
			body: JSON.stringify({
				name: cleanName,
				score: Math.max(roundScore, nextHigh),
				total_xp: updatedStats.totalXp,
				level: calculatedLevel
			})
		});
		return updatedStats;
	} catch (err) {
		console.error("[Scores] persistAccountStats Fehler:", err);
		return null;
	}
}
async function submitScore(name, roundScore, passedLevelOrXp) {
	const cleanName = String(name || "").trim();
	if (!cleanName) return fetchOnlineBoard();
	try {
		const prevStats = await fetchAccountStats(cleanName);
		let totalXp = Number(prevStats?.totalXp) || 0;
		if (totalXp <= 0 && passedLevelOrXp && passedLevelOrXp > 100) totalXp = passedLevelOrXp;
		if (totalXp <= 0) totalXp = Math.max(0, roundScore);
		const calculatedLevel = getPlayerLevel(totalXp);
		const existing = await (await fetch(`${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(cleanName)}&select=id,score`, { headers: headers() })).json().catch(() => []);
		if (Array.isArray(existing) && existing.length > 0) {
			const best = Math.max(Number(existing[0].score) || 0, roundScore);
			await fetch(`${SUPABASE_URL}/rest/v1/highscores?id=eq.${existing[0].id}`, {
				method: "PATCH",
				headers: headers({
					"Content-Type": "application/json",
					Prefer: "return=minimal"
				}),
				body: JSON.stringify({
					score: best,
					total_xp: totalXp,
					level: calculatedLevel
				})
			});
		} else await fetch(`${SUPABASE_URL}/rest/v1/highscores`, {
			method: "POST",
			headers: headers({
				"Content-Type": "application/json",
				Prefer: "return=minimal"
			}),
			body: JSON.stringify({
				name: cleanName,
				score: roundScore,
				total_xp: totalXp,
				level: calculatedLevel
			})
		});
	} catch (err) {
		console.error("[Scores] submitScore Fehler:", err);
	}
	return fetchOnlineBoard();
}
async function fetchOnlineBoard(mode = "single") {
	try {
		const [accRes, hsRes] = await Promise.all([fetch(`${SUPABASE_URL}/rest/v1/accounts?select=username,stats&limit=1000`, { headers: headers() }).catch(() => null), fetch(`${SUPABASE_URL}/rest/v1/highscores?select=name,score,total_xp,level,created_at&limit=1000`, { headers: headers() }).catch(() => null)]);
		const playerMap = /* @__PURE__ */ new Map();
		if (accRes && accRes.ok) {
			const accounts = await accRes.json().catch(() => []);
			if (Array.isArray(accounts)) for (const acc of accounts) {
				const rawName = String(acc?.username || "").trim();
				if (!rawName || rawName.toLowerCase() === "park-besucher" || rawName.toLowerCase() === "parktourist") continue;
				const totalXp = Number(acc?.stats?.totalXp || acc?.stats?.total_xp) || 0;
				const highScore = Number(acc?.stats?.highScore || acc?.stats?.score) || 0;
				const gamesPlayed = Number(acc?.stats?.gamesPlayed) || 0;
				const totalHits = Number(acc?.stats?.totalHits) || 0;
				const equipped = acc?.stats?.equipped || {};
				if (totalXp <= 0 && highScore <= 0 && gamesPlayed <= 0) continue;
				const norm = rawName.toLowerCase();
				const effectiveXp = Math.max(totalXp, highScore);
				const level = getPlayerLevel(effectiveXp);
				playerMap.set(norm, {
					name: rawName,
					score: highScore,
					totalXp: effectiveXp,
					total_xp: effectiveXp,
					level,
					at: Date.now(),
					gamesPlayed,
					totalHits,
					equipped
				});
			}
		}
		if (hsRes && hsRes.ok) {
			const highscores = await hsRes.json().catch(() => []);
			if (Array.isArray(highscores)) for (const hs of highscores) {
				const rawName = String(hs?.name || "").trim();
				if (!rawName || rawName.toLowerCase() === "park-besucher" || rawName.toLowerCase() === "parktourist") continue;
				const score = Number(hs.score) || 0;
				const rowXp = Number(hs.total_xp) || 0;
				if (score <= 0 && rowXp <= 0) continue;
				const norm = rawName.toLowerCase();
				if (playerMap.has(norm)) {
					const existing = playerMap.get(norm);
					existing.score = Math.max(existing.score, score);
					existing.totalXp = Math.max(existing.totalXp, rowXp, existing.score);
					existing.total_xp = existing.totalXp;
					existing.level = getPlayerLevel(existing.totalXp);
					if (hs.created_at) existing.date = hs.created_at;
				} else {
					const totalXp = Math.max(rowXp, score);
					playerMap.set(norm, {
						name: rawName,
						score,
						totalXp,
						total_xp: totalXp,
						level: getPlayerLevel(totalXp),
						date: hs.created_at,
						at: Date.now()
					});
				}
			}
		}
		const entries = Array.from(playerMap.values()).filter((p) => {
			const xp = Number(p.totalXp || p.total_xp || 0);
			const sc = Number(p.score || 0);
			if (mode === "total" || mode === "xp") return xp > 0;
			return sc > 0 || xp > 0;
		});
		if (mode === "total" || mode === "xp") entries.sort((a, b) => {
			const diff = (b.totalXp || 0) - (a.totalXp || 0);
			return diff !== 0 ? diff : (b.score || 0) - (a.score || 0);
		});
		else entries.sort((a, b) => {
			const diff = (b.score || 0) - (a.score || 0);
			return diff !== 0 ? diff : (b.totalXp || 0) - (a.totalXp || 0);
		});
		const result = entries.slice(0, 100);
		if (result.length > 0) saveBoardLocal(result);
		return result;
	} catch (err) {
		console.error("[Scores] Fehler in fetchOnlineBoard:", err);
		return loadBoard();
	}
}
async function syncProfileOnline(p) {
	if (!p?.name?.trim()) return;
	const n = p.name.trim(), x = Number(p.totalXp) || 0, l = getPlayerLevel(x), s = {
		highScore: Number(p.highScore) || 0,
		gamesPlayed: Number(p.gamesPlayed) || 0,
		totalHits: Number(p.totalHits) || 0,
		totalXp: x,
		coins: Number(p.coins) || 0,
		inventory: Array.isArray(p.inventory) ? p.inventory : [],
		equipped: p.equipped || {},
		missions: p.missions || [],
		dailyReward: p.dailyReward || null,
		dailyReward: p.dailyReward || null
	};
	try {
		await fetch(`${SUPABASE_URL}/rest/v1/accounts?username=ilike.${encodeURIComponent(n)}`, {
			method: "PATCH",
			headers: headers({
				"Content-Type": "application/json",
				Prefer: "return=minimal"
			}),
			body: JSON.stringify({ stats: s })
		});
		const d = await (await fetch(`${SUPABASE_URL}/rest/v1/highscores?name=ilike.${encodeURIComponent(n)}&select=id`, { headers: headers() })).json().catch(() => []);
		if (d?.[0]?.id) await fetch(`${SUPABASE_URL}/rest/v1/highscores?id=eq.${d[0].id}`, {
			method: "PATCH",
			headers: headers({
				"Content-Type": "application/json",
				Prefer: "return=minimal"
			}),
			body: JSON.stringify({
				total_xp: x,
				level: l
			})
		});
	} catch (e) {}
}
var SHOP_CATEGORIES = [
	{
		id: "wechselstube",
		label: "XP-Wechselstube",
		icon: "🔋"
	},
	{
		id: "badge",
		label: "Park-Badges",
		icon: "🎖️"
	},
	{
		id: "visier",
		label: "Visier-Farben",
		icon: "🎯"
	}
];
var SHOP_ITEMS = [
	{
		id: "xp_paket_klein",
		name: "Kleiner XP-Schub (+500 XP)",
		description: "Ein Schluck Kamillentee für den nächsten Levelaufstieg.",
		price: 3,
		category: "wechselstube",
		icon: "☕",
		rarity: "standard",
		xpReward: 500,
		available: true
	},
	{
		id: "xp_paket_mittel",
		name: "Doppel-Espresso (+1.500 XP)",
		description: "Pusht deine Level-XP spürbar nach vorne!",
		price: 8,
		category: "wechselstube",
		icon: "🔋",
		rarity: "selten",
		xpReward: 1500,
		available: false
	},
	{
		id: "xp_paket_gross",
		name: "Omas Geheimrezept (+4.000 XP)",
		description: "Ein gigantischer Schub für deinen Rang in der Bestenliste.",
		price: 20,
		category: "wechselstube",
		icon: "🧪",
		rarity: "episch",
		xpReward: 4e3,
		available: false
	},
	{
		id: "badge_neuling",
		name: "Park-Besucher",
		description: "Zeigt jedem, dass du die Bank betreten hast.",
		price: 0,
		category: "badge",
		icon: "🌿",
		badgeIcon: "🌿",
		rarity: "standard",
		available: true
	},
	{
		id: "badge_tauben",
		name: "Tauben-Flüsterer",
		description: "Exklusiv über den 7-Tage Login-Bonus! Zeigt die Taube vor deinem Namen. 🕊️",
		price: 10,
		category: "badge",
		icon: "🕊️",
		badgeIcon: "🕊️",
		rarity: "selten",
		available: false
	},
	{
		id: "badge_sheriff",
		name: "Park-Sheriff",
		description: "Sorgt für Zucht und Ordnung unter den Parkbänken.",
		price: 25,
		category: "badge",
		icon: "🛡️",
		badgeIcon: "🛡️",
		rarity: "episch",
		available: false
	},
	{
		id: "badge_boss",
		name: "Boss der Parkbank",
		description: "Reiner Respekt. Zeigt die goldene Krone neben deinem Namen.",
		price: 50,
		category: "badge",
		icon: "👑",
		badgeIcon: "👑",
		rarity: "legendaer",
		available: false
	},
	{
		id: "visier_standard",
		name: "Klassisch Weiß",
		description: "Das schlichte Standard-Fadenkreuz. Unverzichtbar für jeden Schützen.",
		price: 0,
		category: "visier",
		icon: "⚪",
		crosshairColor: "#ffffff",
		rarity: "standard",
		available: true
	},
	{
		id: "visier_rot",
		name: "Scharfschützen-Rot",
		description: "Aggressives rotes Zielvisier für maximale Zielerfassung.",
		price: 5,
		category: "visier",
		icon: "🔴",
		crosshairColor: "#ef4444",
		rarity: "selten",
		available: false
	},
	{
		id: "visier_neon",
		name: "Giftgrün-Laser",
		description: "Exklusiv über Park-Missionen freischaltbar! 🟢",
		price: 0,
		category: "visier",
		icon: "🟢",
		crosshairColor: "#22c55e",
		rarity: "episch",
		available: false
	},
	{
		id: "visier_gold",
		name: "Goldenes Meister-Visier",
		description: "Aus purem Gold geschmiedetes Fadenkreuz.",
		price: 30,
		category: "visier",
		icon: "🟡",
		crosshairColor: "#eab308",
		rarity: "legendaer",
		available: false
	}
];
function getItemById(id) {
	return SHOP_ITEMS.find((i) => i.id === id);
}
function isItemPurchased(inv, id) {
	if (id === "visier_standard") return true;
	if (!Array.isArray(inv)) return false;
	return inv.includes(id);
}
function isItemEquipped(eq, it) {
	if (!eq) return it.id === "visier_standard";
	if (it.category === "visier") return (eq.visier || "visier_standard") === it.id;
	return eq[it.category] === it.id;
}
function getActiveBadgeIcon(eq) {
	if (!eq || !eq.badge) return null;
	return getItemById(eq.badge)?.badgeIcon ?? null;
}
function getActiveCrosshairColor(eq) {
	if (!eq || !eq.visier) return "#ffffff";
	return getItemById(eq.visier)?.crosshairColor ?? "#ffffff";
}
function getOwnedItemsCount(inv) {
	return SHOP_ITEMS.filter((i) => isItemPurchased(inv, i.id)).length;
}
var KioskModal = ({ isOpen, onClose, profile, onUpdateProfile, initialTab = "shop" }) => {
	const [activeTab, setActiveTab] = (0, import_react.useState)(initialTab);
	const [selectedCategory, setSelectedCategory] = (0, import_react.useState)("alle");
	const [toastMessage, setToastMessage] = (0, import_react.useState)(null);
	const [hasNewItemInModal, setHasNewItemInModal] = (0, import_react.useState)(false);
	import_react.useEffect(() => {
		if (isOpen) setActiveTab(initialTab);
	}, [isOpen, initialTab]);
	const currentCoins = profile?.coins ?? 0;
	const inventory = profile?.inventory ?? [];
	const equipped = profile?.equipped ?? {};
	const showToast = (msg) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 2e3);
	};
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		let changed = false;
		const cleanEquipped = { ...profile.equipped || {} };
		if (cleanEquipped["wechselstube"] || cleanEquipped["xp"]) {
			delete cleanEquipped["wechselstube"];
			delete cleanEquipped["xp"];
			changed = true;
		}
		const xpIds = [
			"xp_paket_klein",
			"xp_paket_mittel",
			"xp_paket_gross"
		];
		for (const [cat, id] of Object.entries(cleanEquipped)) if (xpIds.includes(id)) {
			delete cleanEquipped[cat];
			changed = true;
		}
		const cleanInventory = (profile.inventory || []).filter((id) => !xpIds.includes(id));
		if (cleanInventory.length !== (profile.inventory || []).length) changed = true;
		if (changed) {
			const updated = {
				...profile,
				inventory: cleanInventory,
				equipped: cleanEquipped
			};
			persist(updated);
		}
	}, [profile?.name]);
	const ownedItems = (0, import_react.useMemo)(() => {
		return SHOP_ITEMS.filter((item) => !item.xpReward && item.category !== "wechselstube" && isItemPurchased(inventory, item.id));
	}, [inventory]);
	const visibleItems = (0, import_react.useMemo)(() => {
		const list = activeTab === "shop" ? SHOP_ITEMS : ownedItems;
		if (selectedCategory === "alle") return list;
		return list.filter((item) => item.category === selectedCategory);
	}, [
		activeTab,
		selectedCategory,
		ownedItems
	]);
	if (!isOpen) return null;
	const persist = (updated) => {
		try {
			localStorage.setItem("park_profile", JSON.stringify(updated));
			localStorage.setItem("player_profile", JSON.stringify(updated));
		} catch (e) {}
		onUpdateProfile?.(updated);
	};
	const handleBuy = (item) => {
		if (!profile) return;
		if (currentCoins < item.price) {
			showToast("Zu wenig Oma-Groschen!");
			return;
		}
		if (item.category === "wechselstube" || item.xpReward) {
			const xpToAdd = Number(item.xpReward) || 0;
			const updatedCoins = currentCoins - item.price;
			const cleanedInventory = inventory.filter((id) => id !== item.id);
			const cleanedEquipped = { ...equipped };
			delete cleanedEquipped[item.category];
			const updated = {
				...profile,
				coins: updatedCoins,
				totalXp: (Number(profile.totalXp) || 0) + xpToAdd,
				inventory: cleanedInventory,
				equipped: cleanedEquipped
			};
			persist(updated);
			showToast(`+${xpToAdd} XP erhalten! 🔋`);
			return;
		}
		if (isItemPurchased(inventory, item.id)) {
			showToast("Bereits im Besitz!");
			return;
		}
		const updatedCoins = currentCoins - item.price;
		const updatedInventory = Array.from(/* @__PURE__ */ new Set([...inventory, item.id]));
		setHasNewItemInModal(true);
		if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("kiosk:new_item"));
		const updated = {
			...profile,
			coins: updatedCoins,
			inventory: updatedInventory,
			equipped
		};
		persist(updated);
		showToast(`"${item.name}" liegt jetzt in der Handtasche! 👜`);
	};
	const handleToggleEquip = (item) => {
		if (!profile) return;
		const isEq = isItemEquipped(equipped, item);
		if (item.category === "visier" && isEq) {
			showToast("Das Visier kann nicht abgelegt werden! 🎯");
			return;
		}
		const updatedEquipped = { ...equipped };
		if (isEq) {
			delete updatedEquipped[item.category];
			showToast(`"${item.name}" abgelegt.`);
		} else {
			updatedEquipped[item.category] = item.id;
			showToast(`"${item.name}" angelegt! ✨`);
		}
		const updated = {
			...profile,
			equipped: updatedEquipped
		};
		persist(updated);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4",
		onClick: (e) => {
			if (e.target === e.currentTarget) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-[92vh] sm:h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-neutral-800 bg-neutral-950/70 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-bold text-neutral-100",
								children: "Kiosk & Handtasche"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-neutral-400",
								children: "Parkbank-Ausrüstung & Gear"
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => showToast("🪙 Oma-Groschen erhältst du durch das Abschließen von Missionen und Treffer im Park!"),
								className: "flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 transition-transform active:scale-95 hover:bg-amber-500/25",
								title: "Wie bekomme ich Groschen?",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🪙" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentCoins }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: "Groschen"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onClose,
								className: "flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/80 text-neutral-400 hover:text-white",
								children: "✕"
							})]
						})]
					}),
					toastMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-center text-xs font-medium text-emerald-300",
						children: toastMessage
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveTab("shop"),
							className: `flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${activeTab === "shop" ? "bg-amber-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🏪" }), "Kiosk"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setActiveTab("inventory");
								setHasNewItemInModal(false);
								if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("kiosk:cleared_notification"));
							},
							className: `flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${activeTab === "inventory" ? "bg-amber-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👜" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Handtasche (",
									ownedItems.length,
									")"
								] }),
								hasNewItemInModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "relative flex h-2 w-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-red-500" })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSelectedCategory("alle"),
							className: `whitespace-nowrap rounded-lg px-2.5 py-1 font-medium ${selectedCategory === "alle" ? "bg-neutral-200 text-neutral-900 font-semibold" : "bg-neutral-800 text-neutral-400"}`,
							children: "Alle"
						}), SHOP_CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedCategory(cat.id),
							className: `flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-medium ${selectedCategory === cat.id ? "bg-neutral-200 text-neutral-900 font-semibold" : "bg-neutral-800 text-neutral-400"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cat.icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cat.label })]
						}, cat.id))]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 space-y-2 overflow-y-auto p-3.5",
				children: visibleItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-10 text-center text-xs text-neutral-500",
					children: "Keine Gegenstände vorhanden."
				}) : visibleItems.map((item) => {
					const purchased = isItemPurchased(inventory, item.id);
					const isEq = isItemEquipped(equipped, item);
					const canAfford = currentCoins >= item.price;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center justify-between gap-3 rounded-xl border p-2.5 ${isEq ? "border-amber-500/60 bg-amber-500/10" : "border-neutral-800 bg-neutral-900/90"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-2xl",
								children: item.icon
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-xs font-bold text-neutral-100",
										children: item.name
									}), isEq && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded bg-amber-500/30 px-1 text-[9px] font-bold text-amber-300",
										children: "Aktiv"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-1 text-[11px] text-neutral-400",
									children: item.description
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0",
							children: activeTab === "shop" ? purchased ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: true,
								className: "cursor-default rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-[11px] font-medium text-neutral-500",
								children: "Liegt unterm Strickzeug"
							}) : item.available === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: true,
								className: "cursor-not-allowed rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-[11px] font-medium text-neutral-500",
								children: "🔒 Noch nicht verfügbar"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !canAfford,
								onClick: () => handleBuy(item),
								className: `rounded-lg px-2.5 py-1 text-xs font-bold ${canAfford ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-neutral-800 text-neutral-500"}`,
								children: item.price === 0 ? "Gratis" : `${item.price} 🪙`
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleToggleEquip(item),
								className: `rounded-lg px-2.5 py-1 text-xs font-bold ${isEq ? "bg-neutral-800 text-amber-300" : "bg-amber-600 text-white"}`,
								children: isEq ? "Ablegen" : "Ausrüsten"
							})
						})]
					}, item.id);
				})
			})]
		})
	});
};
var DAILY_REWARD_DAYS = [
	{
		day: 1,
		label: "3 Groschen",
		coins: 3,
		xp: 0,
		icon: "🪙"
	},
	{
		day: 2,
		label: "100 XP",
		coins: 0,
		xp: 100,
		icon: "⚡"
	},
	{
		day: 3,
		label: "6 Groschen",
		coins: 6,
		xp: 0,
		icon: "🪙"
	},
	{
		day: 4,
		label: "100 XP",
		coins: 0,
		xp: 100,
		icon: "⚡"
	},
	{
		day: 5,
		label: "6 Groschen + 100 XP",
		coins: 6,
		xp: 100,
		icon: "🎁"
	},
	{
		day: 6,
		label: "10 Groschen",
		coins: 10,
		xp: 0,
		icon: "💰"
	},
	{
		day: 7,
		label: "Tauben-Flüsterer (🕊️)",
		coins: 0,
		xp: 0,
		badgeId: "badge_tauben",
		badgeIcon: "🕊️",
		icon: "🕊️"
	}
];
function getTodayString() {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getYesterdayString() {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() - 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getDailyRewardStatus(profile) {
	const rawState = profile?.dailyReward || {
		streak: 0,
		lastClaimDate: null
	};
	const today = getTodayString();
	const yesterday = getYesterdayString();
	const lastClaim = rawState.lastClaimDate;
	if (lastClaim === today) return {
		streak: rawState.streak,
		canClaim: null,
		nextDayToClaim: rawState.streak % 7 + 1,
		isClaimedToday: true
	};
	if (lastClaim === yesterday) {
		const nextDay = rawState.streak >= 7 ? 1 : rawState.streak + 1;
		return {
			streak: rawState.streak >= 7 ? 0 : rawState.streak,
			canClaim: nextDay,
			nextDayToClaim: nextDay,
			isClaimedToday: false
		};
	}
	return {
		streak: 0,
		canClaim: 1,
		nextDayToClaim: 1,
		isClaimedToday: false
	};
}
var DailyRewardModal = ({ isOpen, onClose, profile, onClaim }) => {
	if (!isOpen) return null;
	const status = getDailyRewardStatus(profile);
	const canClaim = status.canClaim !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-sm flex-col items-center rounded-2xl border border-line bg-ink p-5 text-center shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl tracking-wide text-paper flex items-center gap-2",
					children: "🎁 7-Tage Login-Bonus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-paper-dim",
					children: "Komm jeden Tag vorbei für Groschen, XP und an Tag 7 das exklusive 🕊️ Tauben-Flüsterer Badge!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "my-4 grid grid-cols-4 gap-2 w-full",
					children: DAILY_REWARD_DAYS.map((item) => {
						const isClaimed = item.day <= status.streak;
						const isTodayTarget = item.day === status.canClaim;
						const isDay7 = item.day === 7;
						let cardStyle = "flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all ";
						if (isDay7) cardStyle += "col-span-2 ";
						if (isClaimed) cardStyle += "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 opacity-80";
						else if (isTodayTarget) cardStyle += "bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 animate-pulse";
						else cardStyle += "bg-ink-3 border-line text-paper-dim opacity-60";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cardStyle,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-muted",
									children: ["Tag ", item.day]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-2xl my-1 select-none ${isDay7 ? "text-3xl" : ""}`,
									children: item.icon
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-semibold leading-tight line-clamp-2",
									children: item.label
								}),
								isClaimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 text-[9px] font-bold text-emerald-400",
									children: "✓ Erhalten"
								}) : isTodayTarget ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 text-[9px] font-bold text-amber-300",
									children: "HEUTE!"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 text-[9px] text-muted",
									children: "Gesperrt"
								})
							]
						}, item.day);
					})
				}),
				canClaim ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onClaim,
					className: "w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-ink font-bold text-sm tracking-wide shadow-lg active:scale-95 transition cursor-pointer",
					children: [
						"🎁 Tag ",
						status.canClaim,
						" Belohnung abholen!"
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full py-2 rounded-xl bg-ink-3 border border-line text-xs font-medium text-paper-dim",
					children: "✓ Heutige Belohnung bereits abgeholt! Morgen gehts weiter."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "mt-3 text-xs text-paper-dim hover:text-paper underline cursor-pointer",
					children: "Schließen"
				})
			]
		})
	});
};
function MissionsModal({ isOpen, onClose, missions, onClaim, onClaimAll, allCompleted, laserClaimed, onClaimLaser }) {
	if (!isOpen) return null;
	const claimable = missions.filter((m) => m.completed && !m.claimed);
	const totalCoins = claimable.reduce((acc, m) => acc + m.rewardCoins, 0);
	const handleClaimAll = () => {
		if (claimable.length === 0) return;
		if (onClaimAll) onClaimAll();
		else claimable.forEach((m) => onClaim(m.id));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-white shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between pb-3 border-b border-neutral-800",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "🎯"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-bold leading-none",
								children: "Park-Missionen"
							}), claimable.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleClaimAll,
								className: "flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse hover:bg-emerald-500/30 active:scale-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"+",
									totalCoins,
									" 🪙"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Holen" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-neutral-400 mt-0.5",
							children: "30 Groschen 🪙 Belohnung & Giftgrün-Laser"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [claimable.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleClaimAll,
							className: "flex items-center gap-1 rounded-xl border border-amber-400/60 bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 shadow animate-bounce active:scale-95",
							title: "Alle einsammeln",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🪙" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["+", totalCoins] })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs font-bold text-neutral-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🪙" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "30 Max" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-400 hover:text-white active:scale-95",
							children: "✕"
						})]
					})]
				}),
				claimable.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleClaimAll,
					className: "w-full mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 py-2 px-3 text-xs font-extrabold text-black shadow-md active:scale-95 transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["🪙 ", claimable.length === 1 ? "Groschen einstecken" : "Alle Groschen einstecken"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "bg-black/20 rounded px-1.5 py-0.5",
						children: [
							"+",
							totalCoins,
							" Groschen"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-3 space-y-2 max-h-[55vh] overflow-y-auto pr-1",
					children: [missions.map((m) => {
						const cur = Math.min(m.progress || 0, m.target);
						const pct = Math.min(100, Math.round(cur / m.target * 100));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-neutral-800 bg-neutral-950/70 p-2.5 space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-bold text-xs text-neutral-100 truncate",
										children: m.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-neutral-400 mt-0.5 leading-tight",
										children: m.description
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "shrink-0 flex items-center",
									children: m.claimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-lg bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400",
										children: "Fertig ✓"
									}) : m.completed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onClaim(m.id),
										className: "rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 text-[11px] font-extrabold shadow animate-pulse active:scale-95",
										children: [
											"+",
											m.rewardCoins,
											" 🪙 Holen"
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-end",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[10px] font-bold text-neutral-200 font-mono",
											children: [
												cur >= 1e3 ? `${(cur / 1e3).toFixed(1)}k` : cur,
												" / ",
												m.target >= 1e3 ? `${m.target / 1e3}k` : m.target
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-amber-400 font-bold mt-0.5",
											children: [
												"+",
												m.rewardCoins,
												" 🪙"
											]
										})]
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 w-full overflow-hidden rounded-full bg-neutral-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full rounded-full transition-all ${m.completed ? "bg-amber-400" : "bg-emerald-500"}`,
									style: { width: `${pct}%` }
								})
							})]
						}, m.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base",
									children: "🏆"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-bold text-xs text-emerald-400",
									children: "Hauptpreis: Giftgrün-Laser Visier"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-neutral-400 mt-0.5",
								children: "Schließe alle 5 Park-Missionen ab, um den Laser einzustecken!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2.5",
								children: laserClaimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Giftgrün-Laser in der Handtasche & aktiv!" })]
								}) : allCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onClaimLaser && onClaimLaser(),
									className: "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 py-2.5 px-4 text-xs font-extrabold text-black shadow-lg shadow-emerald-950/50 animate-bounce active:scale-95 transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "🟢"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "JETZT ABHOLEN: Giftgrün-Laser freischalten!" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-block rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-500",
									children: [
										"🔒 Noch gesperrt (",
										missions.filter((m) => m.completed || m.claimed).length,
										"/5 erledigt)"
									]
								})
							})
						]
					})]
				})
			]
		})
	});
}
var INITIAL_MISSIONS = [
	{
		id: "m_bahndidos",
		title: "Bahndidos im Öko-Modus 🛵",
		description: "Hol 5 Roller-Rocker vom E-Flitzer!",
		category: "bahndidos",
		target: 5,
		progress: 0,
		rewardCoins: 3,
		completed: false,
		claimed: false
	},
	{
		id: "m_talahin",
		title: "Fliegende Talahin 🧞‍♀️",
		description: "Hol die Teppich-Gleiterin 5-mal runter!",
		category: "talahin",
		target: 5,
		progress: 0,
		rewardCoins: 4,
		completed: false,
		claimed: false
	},
	{
		id: "m_hippie",
		title: "Mülltonnen-Hippie 🗑️",
		description: "Deckel drauf! Triff ihn 4-mal in der Tonne.",
		category: "hippie",
		target: 4,
		progress: 0,
		rewardCoins: 3,
		completed: false,
		claimed: false
	},
	{
		id: "m_rounds",
		title: "Dauer-Besucher 🌳",
		description: "Überlebe 10 Park-Runden.",
		category: "rounds",
		target: 10,
		progress: 0,
		rewardCoins: 4,
		completed: false,
		claimed: false
	},
	{
		id: "m_score",
		title: "Parkbank-Legende 🎯",
		description: "Sammle 10.000 Punkte insgesamt!",
		category: "score",
		target: 1e4,
		progress: 0,
		rewardCoins: 6,
		completed: false,
		claimed: false
	}
];
function updateMissionProgress(missions, event) {
	let changed = false;
	return {
		updated: missions.map((m) => {
			let newProg = m.progress || 0;
			if (event.type === "hit") {
				if (m.category === "bahndidos" && event.act === "rocker") {
					newProg += 1;
					changed = true;
				} else if (m.category === "talahin" && event.act === "carpet") {
					newProg += 1;
					changed = true;
				} else if (m.category === "hippie" && event.act === "hippie") {
					newProg += 1;
					changed = true;
				}
			} else if (event.type === "round_end") {
				if (m.category === "rounds") {
					newProg += 1;
					changed = true;
				} else if (m.category === "score" && typeof event.score === "number") {
					newProg += event.score;
					changed = true;
				}
			}
			const completed = newProg >= m.target;
			if (completed !== m.completed || newProg !== m.progress) {
				changed = true;
				return {
					...m,
					progress: newProg,
					completed: completed || m.completed
				};
			}
			return m;
		}),
		changed
	};
}
var WORLD_H = 1600;
var FIRE_CD = .26;
var COMBO_WINDOW = 1.05;
var MAX_ALIVE = 9;
var OMA_KEEP_X = -300;
var OPA_HIT_HOLD = 1.05;
var LANES = [
	{
		y: 960,
		scale: .54,
		z: .2,
		pts: 35,
		speed: 45
	},
	{
		y: 1060,
		scale: .72,
		z: .5,
		pts: 22,
		speed: 65
	},
	{
		y: 1160,
		scale: .92,
		z: .7,
		pts: 14,
		speed: 90
	},
	{
		y: 1290,
		scale: 1.15,
		z: .95,
		pts: 8,
		speed: 118
	}
];
var TREES = [{
	x: 440,
	y: 980,
	z: .14,
	trunkW: 45,
	scale: .48,
	facing: -1
}, {
	x: 460,
	y: 980,
	z: .14,
	trunkW: 45,
	scale: .48,
	facing: 1
}];
var BUSHES = [{
	x: 90,
	y: 920,
	z: .12,
	scale: .46,
	w: 60,
	h: 38,
	facing: 1
}, {
	x: 810,
	y: 920,
	z: .12,
	scale: .46,
	w: 60,
	h: 38,
	facing: -1
}];
var ASSET_KEYS = [
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
var PROFILE_KEY = "bankgeheimnis_profile";
function defaultProfile() {
	return {
		name: "",
		highScore: 0,
		gamesPlayed: 0,
		totalHits: 0
	};
}
function loadProfile() {
	try {
		const raw = localStorage.getItem(PROFILE_KEY);
		if (!raw) return defaultProfile();
		const p = JSON.parse(raw);
		return {
			name: typeof p.name === "string" ? p.name.trim().slice(0, 24) : "",
			highScore: typeof p.highScore === "number" ? Math.max(0, p.highScore) : 0,
			gamesPlayed: typeof p.gamesPlayed === "number" ? Math.max(0, p.gamesPlayed) : 0,
			totalHits: typeof p.totalHits === "number" ? Math.max(0, p.totalHits) : 0
		};
	} catch {
		return defaultProfile();
	}
}
function saveProfile(p) {
	try {
		localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
	} catch {}
}
async function submitHighscore(name, score, highScore) {
	const payload = {
		name,
		score,
		highScore
	};
	for (const url of ["/api/score", "/api/scores"]) try {
		if ((await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		})).ok) return;
	} catch {}
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
		ready: false,
		playerName: "",
		gamesPlayed: 0,
		totalHits: 0
	};
}
var GameEngine = class {
	crosshairColor = "#ffffff";
	setCrosshairColor(color) {
		if (color && typeof color === "string") this.crosshairColor = color;
	}
	canvas;
	ctx;
	images = /* @__PURE__ */ new Map();
	mode = "title";
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
	aimX = 450;
	aimY = 450;
	targets = [];
	particles = [];
	floaters = [];
	holes = [];
	flashes = [];
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
	onHud;
	destroyed = false;
	pointerDown = false;
	peekBusy = /* @__PURE__ */ new Set();
	bushBusy = /* @__PURE__ */ new Set();
	profile = defaultProfile();
	constructor(canvas, onHud) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d", {
			alpha: false,
			desynchronized: true
		}) ?? canvas.getContext("2d");
		this.onHud = onHud;
		this.profile = loadProfile();
		this.highScore = Math.max(topScore(), this.profile.highScore);
		this.profile.highScore = this.highScore;
		saveProfile(this.profile);
		this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.lowPower = this.detectLowPower();
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
			ready: this.ready,
			playerName: this.profile.name,
			gamesPlayed: this.profile.gamesPlayed,
			totalHits: this.profile.totalHits
		};
	}
	emit() {
		this.onHud(this.hud());
	}
	detectLowPower() {
		const mem = navigator.deviceMemory ?? 8;
		const cores = navigator.hardwareConcurrency || 8;
		const weakMem = mem <= 3;
		const weakCpu = cores <= 4 && mem <= 4;
		return this.reduced || weakMem || weakCpu;
	}
	setLowPower(on) {
		if (this.lowPower === on) return;
		this.lowPower = on;
		this.resize();
	}
	async boot() {
		await Promise.all(ASSET_KEYS.map(async (key) => {
			try {
				let img;
				try {
					img = await loadImage(`/assets/${key}.${key === "park-bg" ? "jpg" : "png"}`);
				} catch {
					img = await loadImage(`/${key}.${key === "park-bg" ? "jpg" : "png"}`);
				}
				this.images.set(key, img);
			} catch {}
		}));
		try {
			await preloadSounds();
		} catch {}
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
			x: (e.clientX - r.left) / r.width * 900,
			y: (e.clientY - r.top) / r.height * WORLD_H
		};
	}
	resize() {
		const parent = this.canvas.parentElement;
		if (!parent) return;
		const fit = Math.min(parent.clientWidth / 900, parent.clientHeight / WORLD_H);
		const w = Math.max(1, 900 * fit);
		const h = Math.max(1, WORLD_H * fit);
		this.canvas.style.width = `${w}px`;
		this.canvas.style.height = `${h}px`;
		const raw = window.devicePixelRatio || 1;
		const cap = this.lowPower ? 1 : raw > 2.5 ? 1.25 : Math.min(1.5, raw);
		const dpr = Math.max(1, cap);
		const res = this.lowPower ? .72 : 1;
		this.canvas.width = Math.floor(900 * dpr * res);
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
		this.profile.name = "Spieler";
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
		if ("omaKommando" in this) this.omaKommando = false;
		if ("frenzy" in this) this.frenzy = false;
		if ("frenzyTimer" in this) this.frenzyTimer = 0;
		if ("kommandoTimer" in this) this.kommandoTimer = 0;
		if ("rapidTimer" in this) this.rapidTimer = 0;
		if ("rapidFire" in this) this.rapidFire = false;
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
		this.spawnAcc = .5;
		this.hippieT = 25;
		this.hippieCount = 0;
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
		submitHighscore(this.profile.name, this.score, this.profile.highScore);
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
		if (this.aliveCount() >= this.maxAlive()) return;
		const L = LANES[lane ?? (Math.random() < .34 ? 0 : Math.random() < .5 ? 1 : Math.random() < .58 ? 2 : 3)];
		const run = running ?? Math.random() < .38;
		const fromRight = Math.random() < .5;
		const speed = L.speed * (run ? 2.2 : 1) * rand(.88, 1.18);
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
			phase: "move"
		});
	}
	spawnPeeker() {
		if (this.aliveCount() >= this.maxAlive()) return;
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
		if (this.aliveCount() >= this.maxAlive()) return;
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
	spawnOpa() {
		playOpaSpawn();
		if (this.targets.some((t) => t.act === "opa")) return;
		const fromRight = Math.random() < .5;
		const speed = 65;
		this.targets.push({
			...this.baseTarget(),
			id: this.id++,
			act: "opa",
			x: fromRight ? 960 : -80,
			y: 1180,
			vx: (fromRight ? -1 : 1) * speed,
			z: .76,
			facing: fromRight ? -1 : 1,
			points: -50,
			scale: .92,
			phase: "move"
		});
	}
	spawnCarpet() {
		if (this.targets.some((t) => t.act === "carpet" && t.state === "alive")) return;
		import("./audio-BhYPbTpG.mjs").then((a) => a.playTalahinIntro());
		const fromRight = Math.random() < .5;
		const speed = 190;
		this.targets.push({
			...this.baseTarget(),
			id: this.id++,
			act: "carpet",
			x: fromRight ? 980 : -120,
			y: 340,
			vx: (fromRight ? -1 : 1) * speed,
			vy: 0,
			z: 1.2,
			facing: fromRight ? -1 : 1,
			points: 150,
			scale: .82,
			phase: "move",
			phaseT: Math.random() * Math.PI * 2
		});
	}
	spawnHippie() {
		if (this.targets.some((t) => t.act === "hippie" && t.state === "alive")) return;
		this.targets.push({
			...this.baseTarget(),
			id: this.id++,
			act: "hippie",
			x: rand(200, 700),
			y: -120,
			vy: 1800,
			z: .4,
			scale: .9,
			openStart: rand(1.2, 4),
			openDur: rand(2.2, 3.2),
			standMax: rand(7.5, 9.5),
			points: 150,
			phase: "in"
		});
	}
	spawnRocker() {
		if (this.targets.some((t) => t.act === "rocker" && t.state === "alive")) return;
		import("./audio-BhYPbTpG.mjs").then((a) => a.playRocker());
		const fromRight = Math.random() < .5;
		const speed = 260;
		this.targets.push({
			...this.baseTarget(),
			id: this.id++,
			act: "rocker",
			x: fromRight ? 960 : -80,
			y: 1190,
			vx: (fromRight ? -1 : 1) * speed,
			z: .78,
			facing: fromRight ? -1 : 1,
			points: 200,
			scale: .92,
			phase: "move"
		});
	}
	freeHide(t) {
		if (t.act === "peek" && t.hide >= 0) this.peekBusy.delete(t.hide);
		if (t.act === "bush" && t.hide >= 0) this.bushBusy.delete(t.hide);
		t.hide = -1;
	}
	dashOut(t, run = true) {
		let dir = t.facing;
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
	hitTest(t, x, y) {
		const dw = t.dw || 140 * t.scale;
		const dh = t.dh || 335 * t.scale;
		const left = t.x - dw * .5;
		const right = t.x + dw * .5;
		const top = t.y - dh;
		const bottom = t.y;
		return x >= left && x <= right && y >= top && y <= bottom;
	}
	shoot() {
		if (this.mode !== "playing" || this.fireCd > 0) return;
		this.fireCd = this.strickT > 0 ? .06 : FIRE_CD;
		this.recoil = .12;
		this.shots++;
		playShot();
		if (!this.reduced) this.trauma = Math.min(1, this.trauma + (this.strickT > 0 ? .55 : .32));
		const oma = this.omaRect();
		if (!this.lowPower) this.flashes.push({
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
		if (hit) {
			const isHead = this.aimY <= hit.y - (hit.dh || 80) * .62;
			this.kill(hit, isHead);
		} else if (this.strickT <= 0) {
			this.combo = 0;
			this.score = Math.max(0, this.score - 15);
			this.floaters.push({
				x: this.aimX,
				y: this.aimY,
				text: "-15",
				color: "#ff4d4d",
				life: .8,
				max: .8,
				vy: -40
			});
		}
	}
	kill(t, isHeadshot = false) {
		if (t.state !== "alive") return;
		if (t.act === "hippie") {
			const oS = t.openStart || 2;
			const oE = oS + (t.openDur || 2.5);
			if (!(t.phase === "hold" && t.phaseT >= oS && t.phaseT < oE)) {
				this.score = Math.max(0, this.score - 50);
				this.combo = 0;
				this.floaters.push({
					x: t.x,
					y: t.y - 120,
					text: "Deckel zu! (-50)",
					life: 1,
					max: 1,
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
				y: t.y - (t.dh || 80) * .95,
				text: "Finger weg! (-50)",
				life: 1.15,
				max: 1.15,
				color: "#ef4444"
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
			this.strickT = 5;
			playOmaKommando();
		}
		this.comboT = COMBO_WINDOW;
		if (this.combo > this.bestCombo) this.bestCombo = this.combo;
		let pts = Math.round(t.points * (1 + Math.min(this.combo, 10) * .15));
		if (isHeadshot) {
			pts = Math.round(pts * 2 + 50);
			this.floaters.push({
				x: t.x,
				y: t.y - (t.dh || 80) - 20,
				text: "Wallah, kopfschuss!",
				color: "#ffcc00",
				life: 1.2,
				max: 1.2,
				vy: -60
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
			if (streakText) this.floaters.push({
				x: t.x,
				y: t.y - (t.dh || 80) * .6,
				text: streakText,
				color: streakColor,
				life: .9,
				max: .9,
				vy: -45
			});
		}
		this.score += pts;
		if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("park_hit", { detail: { act: t.act } }));
		playHit(this.combo);
		if (t.act === "oma") playOmaHitVoice();
		else playTalahonHitVoice();
		if (!this.reduced && !this.lowPower) {
			this.trauma = Math.min(1, this.trauma + (t.act === "rocker" ? .7 : .38));
			this.hitstop = t.act === "rocker" ? .09 : .045;
		}
		if (!this.lowPower) {
			this.flashes.push({
				x: t.x,
				y: t.y - t.dh * .5,
				t: .18,
				kind: "impact"
			});
			this.burst(t.x, t.y - t.dh * .45, t.act === "rocker" ? 28 : 16, "#d4a84b", 160);
			this.burst(t.x, t.y - t.dh * .45, 8, "#f3ead8", 90);
		}
		this.floaters.push({
			x: t.x,
			y: t.y - t.dh * .78,
			text: mult > 1 ? `+${pts} ×${mult}` : `+${pts}`,
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
		const h = 560;
		const w = img ? h * (img.width / img.height) : 530;
		const x = -10;
		return {
			x,
			y: 1065,
			w,
			h,
			mx: x + w * .85,
			my: 1149
		};
	}
	loop = (now) => {
		if (this.destroyed) return;
		this.raf = requestAnimationFrame(this.loop);
		if (this.lowPower && this.last && now - this.last < 32) return;
		const dt = this.last ? (now - this.last) / 1e3 : .016;
		this.last = now;
		if (dt > 0 && dt < .25) {
			this.fpsAcc += dt;
			this.fpsFrames++;
			if (dt > .033) this.slowFrames++;
			else this.slowFrames = Math.max(0, this.slowFrames - 1);
			if (this.fpsAcc >= 1.2) {
				if (this.fpsFrames / this.fpsAcc < 42) this.setLowPower(true);
				this.fpsAcc = 0;
				this.fpsFrames = 0;
			}
			if (this.slowFrames > 18) this.setLowPower(true);
		}
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
		if (this.strickT > 0) {
			this.strickT = Math.max(0, this.strickT - dt);
			if (this.strickT === 0) stopOmaKommando();
		}
		this.comboT -= dt;
		if (this.comboT <= 0) this.combo = 0;
		this.hudAcc += dt;
		if (this.pointerDown && this.strickT > 0 && this.mode === "playing") this.shoot();
		if (this.hudAcc > .12) {
			this.hudAcc = 0;
			this.emit();
		}
		const progress = 1 - this.timeLeft / 90;
		const spawnWait = 1.05 - progress * .62;
		this.spawnAcc -= this.strickT > 0 ? dt * 2.2 : dt;
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
			const fps = t.state === "falling" ? 10 : t.act === "run" ? 12 : t.act === "walk" ? 8 : t.act === "peek" ? 4 : t.act === "bush" ? 6 : 0;
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
							t.facing = t.x < 450 ? -1 : 1;
							t.vx = t.facing * 220;
						}
					} else {
						t.phaseT += dt;
						t.x += t.vx * dt + Math.sin(t.phaseT * 22) * 210 * dt;
						t.y = 1180 + Math.abs(Math.sin(t.phaseT * 20)) * 10;
						t.rot = Math.sin(t.phaseT * 22) * .16;
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
				t.rot = Math.cos(t.phaseT) * .12 * (t.vx > 0 ? 1 : -1);
				t.frameT += dt;
				if (t.frameT > .14) {
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
					(t.openStart || 2) + (t.openDur || 2.5);
					const standMax = t.standMax || 8;
					const wobbleStart = t.phaseT <= .5;
					const wobbleEnd = t.phaseT >= standMax - .7 && t.phaseT <= standMax;
					if (wobbleStart || wobbleEnd) t.rot = Math.sin(t.phaseT * 28) * .08;
					else t.rot = 0;
					if (t.phaseT > standMax) {
						t.phase = "out";
						t.phaseT = 0;
						this.burst(t.x, 1e3, 24, "#cbd5e1", 140);
					}
				} else if (t.phase === "out") t.x = -999;
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
	spriteFor(t) {
		if (t.act === "hippie") {
			if (t.state === "falling") return this.img("tonne-umgekippt") || this.img("tonne-zu");
			const oS = t.openStart || 2;
			const oE = oS + (t.openDur || 2.5);
			if (t.phase === "hold" && t.phaseT >= oS && t.phaseT < oE) return this.img("tonne-hippie") || this.img("tonne-zu");
			return this.img("tonne-zu");
		}
		if (t.act === "opa") {
			const showHit = t.state === "falling" && t.phase !== "leave";
			return this.img(showHit ? "opa_hit" : "opa_walk");
		}
		if (t.act === "carpet") return this.img(t.frame % 2 === 0 ? "talahin_1" : "talahin_2");
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
		ctx.imageSmoothingQuality = this.lowPower ? "low" : "high";
		ctx.clearRect(0, 0, 900, WORLD_H);
		const shake = this.reduced || this.mode !== "playing" ? 0 : this.trauma * this.trauma * (this.strickT > 0 ? 1.85 : 1);
		const ox = shake ? (Math.random() * 2 - 1) * 14 * shake : 0;
		const oy = shake ? (Math.random() * 2 - 1) * 10 * shake : 0;
		ctx.translate(ox, oy);
		const bg = this.img("park-bg");
		if (bg) {
			const targetRatio = 900 / WORLD_H;
			const srcW = bg.height * targetRatio;
			const srcX = (bg.width - srcW) / 2;
			ctx.drawImage(bg, srcX, 0, srcW, bg.height, 0, 0, 900, WORLD_H);
		} else {
			ctx.fillStyle = "#6ea0c8";
			ctx.fillRect(0, 0, 900, WORLD_H);
			ctx.fillStyle = "#3d6b3a";
			ctx.fillRect(0, 800, 900, WORLD_H);
		}
		for (const hole of this.holes) {
			ctx.fillStyle = `rgba(10,10,10,${.55 * hole.a})`;
			ctx.beginPath();
			ctx.ellipse(hole.x, hole.y, hole.r, hole.r * .75, 0, 0, Math.PI * 2);
			ctx.fill();
		}
		const sorted = this.targets.slice().sort((a, b) => a.z !== b.z ? a.z - b.z : a.y - b.y);
		if (!(this.mode === "playing")) return;
		const barX = 605;
		const barY = 205;
		const barW = 210;
		const barH = 18;
		const maxCombo = 13;
		const isStrickActive = (this.strickT || 0) > 0;
		if (isStrickActive) ctx.globalAlpha = .85 + Math.sin(Date.now() / 80) * .15;
		ctx.fillStyle = "rgba(20, 20, 20, 0.75)";
		ctx.beginPath();
		ctx.roundRect(barX, barY, barW, barH, 9);
		ctx.fill();
		const progress = isStrickActive ? Math.max(0, Math.min(1, this.strickT / 5)) : Math.max(0, Math.min(1, (this.combo || 0) / maxCombo));
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
		ctx.fillText(isStrickActive ? "🔥" : "🧶", 815, 214);
		let treeDrawn = false;
		for (const t of sorted) {
			if (!treeDrawn && t.z >= .3) {
				const tree = this.img("tree");
				if (tree) {
					const targetRatio = 900 / WORLD_H;
					const srcW = tree.height * targetRatio;
					const srcX = (tree.width - srcW) / 2;
					ctx.drawImage(tree, srcX, 0, srcW, tree.height, 0, 0, 900, WORLD_H);
				}
				treeDrawn = true;
			}
			this.drawTarget(t);
		}
		if (!treeDrawn) {
			const tree = this.img("tree");
			if (tree) {
				const targetRatio = 900 / WORLD_H;
				const srcW = tree.height * targetRatio;
				const srcX = (tree.width - srcW) / 2;
				ctx.drawImage(tree, srcX, 0, srcW, tree.height, 0, 0, 900, WORLD_H);
			}
		}
		if (this.strickT > 0) {
			ctx.save();
			const pulse = 1 + Math.sin(Date.now() / 90) * .06;
			ctx.translate(450, 380);
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
		if (foliage) ctx.drawImage(foliage, 0, 1340, 900, 260);
		const oma = this.omaRect();
		ctx.globalAlpha = 1;
		const omaImg = this.img(this.recoil > .02 ? "oma-recoil" : "oma");
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
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .6);
			ctx.restore();
		}
		if (!this.lowPower) for (const f of this.flashes) {
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
			ctx.font = `900 ${f.text.includes("Wallah") ? 58 : f.text.startsWith("-") ? 48 : 40}px sans-serif`;
			ctx.fillStyle = f.color;
			ctx.strokeStyle = "rgba(10,10,10,0.82)";
			ctx.lineWidth = 7;
			ctx.textAlign = "center";
			ctx.strokeText(f.text, f.x + ox, f.y + oy);
			ctx.fillText(f.text, f.x + ox, f.y + oy);
			ctx.restore();
		}
		if (this.mode === "playing") {
			const activeHippie = this.targets.find((t) => t.act === "hippie" && t.state === "alive" && t.phase !== "out");
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (!activeHippie && this.hippieT <= 5 && this.hippieT > 0 && (this.hippieCount || 0) < 2) {
				const warnPulse = 1 + Math.sin(Date.now() * .015) * .08;
				ctx.font = "900 " + Math.round(18 * warnPulse) + "px sans-serif";
				ctx.fillStyle = "#f59e0b";
				ctx.strokeStyle = "rgba(0,0,0,0.85)";
				ctx.lineWidth = 5;
				const msg = "⚠️ HIPPIE IN: " + Math.ceil(this.hippieT) + "s ⚠️";
				ctx.strokeText(msg, 450, 215);
				ctx.fillText(msg, 450, 215);
			} else if (activeHippie && activeHippie.phase === "hold") {
				const oS = activeHippie.openStart || 2;
				const oE = oS + (activeHippie.openDur || 2.5);
				if (activeHippie.phaseT >= oS && activeHippie.phaseT < oE) {
					ctx.font = "900 19px sans-serif";
					ctx.fillStyle = "#22c55e";
					ctx.strokeStyle = "rgba(0,0,0,0.85)";
					ctx.lineWidth = 5;
					ctx.strokeText("🎯 JETZT TREFFEN!", 450, 215);
					ctx.fillText("🎯 JETZT TREFFEN!", 450, 215);
				}
			}
			ctx.restore();
		}
		if (this.mode === "playing" || this.mode === "paused") this.drawCrosshair();
	}
	clipOccluders(_ctx, _t) {}
	drawTarget(t) {
		const sprite = this.spriteFor(t);
		const ctx = this.ctx;
		let w = 140 * t.scale;
		let h = 180 * t.scale;
		if (sprite) {
			const ratio = sprite.width / sprite.height;
			h = (t.act === "hippie" ? 260 : t.act === "rocker" ? 430 : t.act === "opa" ? 380 : t.act === "peek" ? 340 : t.act === "bush" ? 335 : 320) * t.scale;
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
			if (t.facing > 0) ctx.rect(tree.x - 2, 0, 900, WORLD_H);
			else ctx.rect(0, 0, tree.x + 2, WORLD_H);
			ctx.clip();
		}
		ctx.translate(t.x, t.y);
		ctx.rotate(t.rot);
		if (!(t.act === "opa" && t.state === "falling" && t.phase !== "leave") && t.facing < 0) ctx.scale(-1, 1);
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
		const cColor = this.crosshairColor || "#ffffff";
		ctx.strokeStyle = cColor;
		ctx.fillStyle = cColor;
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
};
function minXpForLevel(level) {
	return Math.pow(Math.max(1, Math.round(level || 1)) - 1, 2) * 2500;
}
function bestSingleRound(localHigh, totalXp, gamesPlayed, boardScore, statsHigh = 0) {
	const sum = Math.max(0, totalXp || 0);
	const polluted = (v) => (gamesPlayed || 0) > 1 && sum > 0 && Math.max(0, v || 0) === sum;
	let rec = 0;
	if (!polluted(localHigh)) rec = Math.max(rec, localHigh || 0);
	if (!polluted(statsHigh)) rec = Math.max(rec, statsHigh || 0);
	rec = Math.max(rec, boardScore || 0);
	return rec;
}
function getOmaRank(score) {
	if (score >= 4e4) return {
		title: "👑 Die scharfe Sibylle",
		desc: "Endgegnerin: Meisterin der Parabellum, absolute Herrscherin über den Park.",
		color: "text-amber-400 border-amber-500/50 bg-amber-950/40"
	};
	if (score >= 3e4) return {
		title: "💥 Parabellum-Gretel",
		desc: "Schneller am Abzug als jede Kappe fliegen kann.",
		color: "text-red-400 border-red-500/50 bg-red-950/40"
	};
	if (score >= 22e3) return {
		title: "🪑 Parkbank-Legende",
		desc: "Hält Hof auf der Bank – kein Schattenboxer kommt vorbei.",
		color: "text-purple-400 border-purple-500/50 bg-purple-950/40"
	};
	if (score >= 15e3) return {
		title: "🎯 Nadel-Scharfschützin",
		desc: "Jeder Schuss sitzt präzise wie eine rechte Masche.",
		color: "text-blue-400 border-blue-500/50 bg-blue-950/40"
	};
	if (score >= 9e3) return {
		title: "⚡ Kleine Bella",
		desc: "Flink, treffsicher und räumt die E-Scooter vom Gehweg ab.",
		color: "text-emerald-400 border-emerald-500/50 bg-emerald-950/40"
	};
	if (score >= 4e3) return {
		title: "🪡 Strickliesel-Schützin",
		desc: "Erste Maschen sitzen – die Fake-Caps fliegen im hohen Bogen.",
		color: "text-yellow-300 border-yellow-500/40 bg-yellow-950/30"
	};
	return {
		title: "🧶 Wollknäuel-Werferin",
		desc: "Verheddert sich noch in den Maschen, trifft höchstens die Parkbank.",
		color: "text-stone-300 border-stone-600 bg-stone-900/40"
	};
}
var primaryBtn = "h-12 rounded-md bg-paper px-6 font-display text-2xl tracking-wide text-ink transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]";
var ghostBtn = "h-11 rounded-md border border-line px-6 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-3 hover:text-paper";
function GameScreen() {
	(0, import_react.useEffect)(() => {
		const lockScroll = () => {
			window.scrollTo(0, 0);
			if (document.body) document.body.scrollTop = 0;
			if (document.documentElement) document.documentElement.scrollTop = 0;
		};
		lockScroll();
		window.addEventListener("resize", lockScroll);
		window.addEventListener("orientationchange", lockScroll);
		return () => {
			window.removeEventListener("resize", lockScroll);
			window.removeEventListener("orientationchange", lockScroll);
		};
	}, []);
	const [showAllScores, setShowAllScores] = import_react.useState(false);
	const [showStatsModal, setShowStatsModal] = (0, import_react.useState)(false);
	const [inspectedPlayer, setInspectedPlayer] = (0, import_react.useState)(null);
	const [isKioskOpen, setIsKioskOpen] = import_react.useState(false);
	const [isMissionsOpen, setIsMissionsOpen] = import_react.useState(false);
	const [isDailyRewardOpen, setIsDailyRewardOpen] = import_react.useState(false);
	import_react.useEffect(() => {
		const handleParkHit = (e) => {
			const act = e?.detail?.act;
			if (!act) return;
			pendingMissionActsRef.current.push(act);
		};
		window.addEventListener("park_hit", handleParkHit);
		return () => window.removeEventListener("park_hit", handleParkHit);
	}, []);
	const [kioskTab, setKioskTab] = import_react.useState("shop");
	const [hasHandbagNotification, setHasHandbagNotification] = import_react.useState(false);
	import_react.useEffect(() => {
		const onNew = () => setHasHandbagNotification(true);
		const onClear = () => setHasHandbagNotification(false);
		window.addEventListener("kiosk:new_item", onNew);
		window.addEventListener("kiosk:cleared_notification", onClear);
		return () => {
			window.removeEventListener("kiosk:new_item", onNew);
			window.removeEventListener("kiosk:cleared_notification", onClear);
		};
	}, []);
	const [showPwModal, setShowPwModal] = (0, import_react.useState)(false);
	const [oldPwInput, setOldPwInput] = (0, import_react.useState)("");
	const [newPwInput, setNewPwInput] = (0, import_react.useState)("");
	const [pwChangeError, setPwChangeError] = (0, import_react.useState)(null);
	const [pwChangeSuccess, setPwChangeSuccess] = (0, import_react.useState)(false);
	const [pwChangeLoading, setPwChangeLoading] = (0, import_react.useState)(false);
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const gameOverHandledRef = (0, import_react.useRef)(false);
	const pendingMissionActsRef = (0, import_react.useRef)([]);
	const [hud, setHud] = (0, import_react.useState)(emptyHud());
	const [omaLine, setOmaLine] = (0, import_react.useState)(false);
	const [board, setBoard] = (0, import_react.useState)([]);
	const [boardTab, setBoardTab] = (0, import_react.useState)("highscore");
	const [profile, setProfile] = (0, import_react.useState)({
		name: "",
		highScore: 0,
		gamesPlayed: 0,
		totalHits: 0,
		totalXp: 0
	});
	const [missions, setMissions] = import_react.useState(INITIAL_MISSIONS);
	import_react.useEffect(() => {
		if (!profile?.name?.trim()) {
			setMissions(INITIAL_MISSIONS);
			return;
		}
		if (Array.isArray(profile.missions) && profile.missions.length > 0) setMissions(profile.missions);
		else setMissions(INITIAL_MISSIONS);
	}, [profile?.name, profile?.missions]);
	const [profileInput, setProfileInput] = (0, import_react.useState)("");
	const [passwordInput, setPasswordInput] = (0, import_react.useState)("");
	const [authLoading, setAuthLoading] = (0, import_react.useState)(false);
	const [isSecured, setIsSecured] = (0, import_react.useState)(true);
	const [claimPassword, setClaimPassword] = (0, import_react.useState)("");
	const [claimError, setClaimError] = (0, import_react.useState)(null);
	const [profileError, setProfileError] = (0, import_react.useState)(null);
	const [nameError, setNameError] = (0, import_react.useState)(null);
	const [isEditing, setIsEditing] = (0, import_react.useState)(false);
	const [chatMsgs, setChatMsgs] = (0, import_react.useState)([]);
	const [chatInput, setChatInput] = (0, import_react.useState)("");
	const chatRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!profile || !profile.name || isEditing) return;
		const fetchChat = async () => {
			try {
				const res = await fetch(`https://lforuvtpskrnydlburpt.supabase.co/rest/v1/chat_messages?select=name,text&order=created_at.desc&limit=30`, { headers: {
					apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY",
					Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY"
				} });
				if (res.ok) setChatMsgs((await res.json()).reverse());
			} catch (e) {}
		};
		fetchChat();
		const iv = setInterval(fetchChat, 2e3);
		return () => clearInterval(iv);
	}, [profile?.name, isEditing]);
	(0, import_react.useEffect)(() => {
		if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
	}, [chatMsgs]);
	const [name, setName] = (0, import_react.useState)("");
	const [named, setNamed] = (0, import_react.useState)(false);
	const [resultsDelay, setResultsDelay] = (0, import_react.useState)(false);
	const [endXpDisplay, setEndXpDisplay] = (0, import_react.useState)({
		startTotal: 0,
		gained: 0,
		liveTotal: 0,
		oldLevel: 1,
		newLevel: 1
	});
	const [isFullscreen, setIsFullscreen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const handleVisibility = () => {
			if (document.hidden && hud.mode === "playing") engineRef.current?.pause();
		};
		document.addEventListener("visibilitychange", handleVisibility);
		return () => document.removeEventListener("visibilitychange", handleVisibility);
	}, [hud.mode]);
	(0, import_react.useEffect)(() => {
		const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", handleFs);
		return () => document.removeEventListener("fullscreenchange", handleFs);
	}, []);
	(0, import_react.useEffect)(() => {
		const p = loadProfile$1();
		if (p.name) fetchAccountStats(p.name).then((onlineStats) => {
			if (!onlineStats) return;
			setProfile((current) => {
				const merged = {
					...current,
					coins: onlineStats.coins !== void 0 && onlineStats.coins !== null ? Number(onlineStats.coins) : current.coins || 0,
					totalXp: Math.max(current.totalXp || 0, Number(onlineStats.totalXp) || 0),
					inventory: Array.from(/* @__PURE__ */ new Set([...current.inventory || [], ...onlineStats.inventory || []])),
					equipped: {
						...onlineStats.equipped || {},
						...current.equipped || {}
					},
					dailyReward: onlineStats.dailyReward || current.dailyReward
				};
				try {
					localStorage.setItem("park_profile", JSON.stringify(merged));
					localStorage.setItem("bankgeheimnis_user_" + p.name.toLowerCase(), JSON.stringify(merged));
				} catch {}
				return merged;
			});
		}).catch(() => {});
		if (!p.name) {
			setIsEditing(true);
			setProfile(p);
			setProfileInput("");
			setMissions(INITIAL_MISSIONS);
			return;
		}
		if (Array.isArray(p.missions) && p.missions.length > 0) setMissions(p.missions);
		fetchOnlineBoard().then((boardData) => {
			const entry = boardData.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
			const onlineScore = entry ? Number(entry.score) || 0 : 0;
			const onlineLevel = entry ? Number(getPlayerLevel(entry.totalXp || entry.total_xp || entry.score)) || 1 : 1;
			const best = bestSingleRound(p.highScore || 0, p.totalXp || 0, p.gamesPlayed || 0, onlineScore);
			const totalXp = Math.max(p.totalXp || 0, entry ? Number(entry.totalXp) || 0 : 0, minXpForLevel(onlineLevel));
			const fixed = {
				...p,
				highScore: best,
				totalXp
			};
			saveProfile$1(fixed);
			setProfile(fixed);
			setProfileInput(fixed.name);
			persistAccountStats(fixed.name, {
				gamesPlayed: fixed.gamesPlayed,
				totalHits: fixed.totalHits,
				totalXp: fixed.totalXp,
				highScore: fixed.highScore
			}).then(() => fetchOnlineBoard().then((fresh) => {
				if (fresh && fresh.length > 0) setBoard(fresh);
			})).catch(() => {});
		}).catch(() => {
			setProfile(p);
			setProfileInput(p.name);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		fetchOnlineBoard(boardTab === "xp" ? "total" : "single").then((data) => {
			if (!data || data.length === 0) return;
			const me = (profile.name || "").trim().toLowerCase();
			const localXp = profile.totalXp || 0;
			setBoard(data.map((row) => {
				if (!me || row.name.trim().toLowerCase() !== me) return row;
				const xp = Math.max(row.totalXp || 0, localXp);
				return {
					...row,
					totalXp: xp,
					level: getPlayerLevel(xp)
				};
			}));
		});
	}, [
		hud.mode,
		boardTab,
		profile.name,
		profile.totalXp
	]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new GameEngine(canvas, setHud);
		if (profile?.equipped) engine.setCrosshairColor(getActiveCrosshairColor(profile.equipped));
		engineRef.current = engine;
		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (engineRef.current && profile?.equipped) {
			const color = getActiveCrosshairColor(profile.equipped);
			engineRef.current.setCrosshairColor(color);
		}
	}, [profile?.equipped]);
	(0, import_react.useEffect)(() => {
		if (hud.mode === "playing") {
			gameOverHandledRef.current = false;
			pendingMissionActsRef.current = [];
		}
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
			if (gameOverHandledRef.current) return;
			const finalActs = [...pendingMissionActsRef.current];
			pendingMissionActsRef.current = [];
			const prevTotal = Number(profile?.totalXp) || 0;
			const gainedPoints = Number(hud.score) || 0;
			const finalTotal = prevTotal + gainedPoints;
			const lvlBefore = getPlayerLevel(prevTotal);
			const lvlAfter = getPlayerLevel(finalTotal);
			setEndXpDisplay({
				startTotal: prevTotal,
				gained: gainedPoints,
				liveTotal: prevTotal,
				oldLevel: lvlBefore,
				newLevel: lvlAfter
			});
			setResultsDelay(true);
			const t = window.setTimeout(() => {
				setResultsDelay(false);
				const startTime = performance.now();
				const duration = 1200;
				const tick = (now) => {
					const elapsed = now - startTime;
					const progress = Math.min(1, elapsed / duration);
					const current = Math.round(prevTotal + (finalTotal - prevTotal) * progress);
					setEndXpDisplay((prev) => ({
						...prev,
						liveTotal: current
					}));
					if (progress < 1) requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			}, 2e3);
			const activeName = profile?.name?.trim() || "";
			if (activeName) {
				gameOverHandledRef.current = true;
				const p = loadProfile$1(activeName);
				let currentMissions = Array.isArray(p.missions) && p.missions.length > 0 ? p.missions : Array.isArray(profile.missions) && profile.missions.length > 0 ? profile.missions : missions;
				for (const act of finalActs) currentMissions = updateMissionProgress(currentMissions, {
					type: "hit",
					act
				}).updated;
				currentMissions = updateMissionProgress(currentMissions, {
					type: "round_end",
					score: hud.score || 0
				}).updated;
				p.gamesPlayed = (p.gamesPlayed || 0) + 1;
				p.totalHits = (p.totalHits || 0) + hud.hits;
				p.totalXp = (p.totalXp || 0) + hud.score;
				if (hud.score > p.highScore) p.highScore = hud.score;
				p.missions = currentMissions;
				saveProfile$1(p);
				setMissions(currentMissions);
				setProfile(p);
				try {
					if (typeof syncProfileOnline === "function") syncProfileOnline(p);
				} catch {}
				persistAccountStats(activeName, {
					gamesPlayed: p.gamesPlayed,
					totalHits: p.totalHits,
					totalXp: p.totalXp,
					highScore: p.highScore,
					roundScore: hud.score,
					roundHits: hud.hits
				}).catch(() => {});
				setNamed(true);
				setName(activeName);
				if (p.highScore > 0 || hud.score > 0) submitScore(activeName, Math.max(p.highScore || 0, hud.score || 0), getPlayerLevel(p.totalXp || 0)).then((up) => {
					if (up && up.length > 0) setBoard(up);
				});
				else fetchOnlineBoard().then((data) => {
					if (data && data.length > 0) setBoard(data);
				});
			} else {
				setNamed(!qualifies(hud.score));
				fetchOnlineBoard().then((data) => {
					if (data && data.length > 0) setBoard(data);
				});
			}
			return () => window.clearTimeout(t);
		}
	}, [
		hud.mode,
		hud.score,
		hud.hits,
		profile.name
	]);
	(0, import_react.useEffect)(() => {
		if (!profile.name) {
			setIsSecured(true);
			return;
		}
		const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
		const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
		fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(profile.name)}&select=id`, { headers: {
			apikey: SUPA_KEY,
			Authorization: `Bearer ${SUPA_KEY}`
		} }).then((r) => r.json()).then((data) => {
			setIsSecured(Array.isArray(data) && data.length > 0);
		}).catch(() => setIsSecured(true));
	}, [profile.name]);
	const hashPassword = async (pw) => {
		const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
		return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
	};
	const handleSecureAccount = async () => {
		const pw = claimPassword.trim();
		if (!pw || pw.length < 4) return setClaimError("Min. 4 Zeichen!");
		setClaimError(null);
		setAuthLoading(true);
		try {
			const pwHash = await hashPassword(pw);
			const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
			const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
			if ((await fetch(`${SUPA_URL}/rest/v1/accounts`, {
				method: "POST",
				headers: {
					apikey: SUPA_KEY,
					Authorization: `Bearer ${SUPA_KEY}`,
					"Content-Type": "application/json",
					Prefer: "return=minimal"
				},
				body: JSON.stringify({
					username: profile.name,
					password_hash: pwHash
				})
			})).ok) {
				setIsSecured(true);
				setClaimPassword("");
			} else setClaimError("Sichern fehlgeschlagen.");
		} catch {
			setClaimError("Server-Fehler.");
		} finally {
			setAuthLoading(false);
		}
	};
	const handleAuth = async () => {
		const clName = profileInput.trim();
		const clPw = passwordInput.trim();
		if (!clName || clName.length < 2) return setProfileError("Name min. 2 Zeichen!");
		if (!clPw || clPw.length < 4) return setProfileError("Passwort min. 4 Zeichen!");
		setAuthLoading(true);
		setProfileError(null);
		const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
		const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
		try {
			const pwHash = await hashPassword(clPw);
			const data = await (await fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(clName)}&select=username,password_hash,stats`, { headers: {
				apikey: SUPA_KEY,
				Authorization: `Bearer ${SUPA_KEY}`
			} })).json();
			if (data && data.length > 0) {
				if (data[0].password_hash !== pwHash) {
					setProfileError("Falsches Passwort für diesen Namen!");
					setAuthLoading(false);
					return;
				}
			} else {
				const board = await fetchOnlineBoard();
				const existsInBoard = board.some((x) => x.name.toLowerCase() === clName.toLowerCase());
				const isCurrentLocalOwner = (profile.name || "").toLowerCase() === clName.toLowerCase();
				if (existsInBoard && !isCurrentLocalOwner) {
					setProfileError("Name wird bereits in der Bestenliste verwendet!");
					setAuthLoading(false);
					return;
				}
				const boardEntry = board.find((x) => x.name.toLowerCase() === clName.toLowerCase());
				boardEntry && boardEntry.score;
				if (!(await fetch(`${SUPA_URL}/rest/v1/accounts`, {
					method: "POST",
					headers: {
						apikey: SUPA_KEY,
						Authorization: `Bearer ${SUPA_KEY}`,
						"Content-Type": "application/json",
						Prefer: "return=minimal"
					},
					body: JSON.stringify({
						username: clName,
						password_hash: pwHash
					})
				})).ok) {
					setProfileError("Registrierung fehlgeschlagen.");
					setAuthLoading(false);
					return;
				}
			}
			const sStats = data && data[0] && typeof data[0].stats === "object" && data[0].stats ? data[0].stats : {};
			const ex = loadProfile$1(clName);
			const onlineEntry = (await fetchOnlineBoard()).find((x) => x.name.toLowerCase() === clName.toLowerCase());
			const boardScore = onlineEntry ? Number(onlineEntry.score) || 0 : 0;
			const boardLevel = onlineEntry ? Number(onlineEntry.level) || 1 : 1;
			const mergedGames = Math.max(ex.gamesPlayed || 0, Number(sStats.gamesPlayed) || 0);
			const mergedHits = Math.max(ex.totalHits || 0, Number(sStats.totalHits) || 0);
			const cloudXp = Number(sStats.totalXp) || 0;
			const mergedXp = Math.max(cloudXp, ex.totalXp || 0, boardScore, minXpForLevel(boardLevel));
			const finalHighScore = bestSingleRound(ex.highScore || 0, mergedXp, mergedGames, boardScore, Number(sStats.highScore) || 0);
			const up = {
				...ex,
				name: clName,
				highScore: finalHighScore,
				gamesPlayed: mergedGames,
				totalHits: mergedHits,
				totalXp: mergedXp,
				coins: sStats && sStats.coins !== void 0 && sStats.coins !== null ? Number(sStats.coins) : Number(ex.coins) || 0,
				inventory: Array.from(/* @__PURE__ */ new Set([...Array.isArray(ex.inventory) ? ex.inventory : [], ...Array.isArray(sStats.inventory) ? sStats.inventory : []])),
				equipped: {
					...sStats.equipped || {},
					...ex.equipped || {}
				},
				missions: Array.isArray(sStats.missions) && sStats.missions.length > 0 ? sStats.missions : Array.isArray(ex.missions) && ex.missions.length > 0 ? ex.missions : INITIAL_MISSIONS,
				dailyReward: sStats && sStats.dailyReward ? sStats.dailyReward : ex.dailyReward || null
			};
			saveProfile$1(up);
			setProfile(up);
			if (Array.isArray(up.missions) && up.missions.length > 0) setMissions(up.missions);
			setPasswordInput("");
			setIsEditing(false);
			persistAccountStats(clName, {
				gamesPlayed: up.gamesPlayed,
				totalHits: up.totalHits,
				totalXp: up.totalXp,
				highScore: up.highScore
			}).catch(() => {});
			if (up.highScore > 0) submitScore(clName, up.highScore, getPlayerLevel(up.totalXp || 0)).then((boardData) => {
				if (boardData && boardData.length > 0) setBoard(boardData);
			}).catch(() => {});
		} catch (e) {
			setProfileError("Fehler bei der Server-Verbindung.");
		} finally {
			setAuthLoading(false);
		}
	};
	const handleChangePassword = async () => {
		if (!profile.name) return;
		const oldPw = oldPwInput.trim();
		const newPw = newPwInput.trim();
		if (!oldPw) return setPwChangeError("Bitte altes Passwort eingeben!");
		if (!newPw || newPw.length < 4) return setPwChangeError("Neues Passwort min. 4 Zeichen!");
		if (oldPw === newPw) return setPwChangeError("Neues Passwort muss anders sein!");
		setPwChangeLoading(true);
		setPwChangeError(null);
		try {
			const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
			const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
			const oldHash = await hashPassword(oldPw);
			const data = await (await fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(profile.name)}&select=password_hash`, { headers: {
				apikey: SUPA_KEY,
				Authorization: `Bearer ${SUPA_KEY}`
			} })).json();
			if (!data || data.length === 0 || data[0].password_hash !== oldHash) {
				setPwChangeError("Altes Passwort ist falsch!");
				setPwChangeLoading(false);
				return;
			}
			const newHash = await hashPassword(newPw);
			if ((await fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(profile.name)}`, {
				method: "PATCH",
				headers: {
					apikey: SUPA_KEY,
					Authorization: `Bearer ${SUPA_KEY}`,
					"Content-Type": "application/json",
					Prefer: "return=minimal"
				},
				body: JSON.stringify({ password_hash: newHash })
			})).ok) {
				setPwChangeSuccess(true);
				setOldPwInput("");
				setNewPwInput("");
				setTimeout(() => {
					setShowPwModal(false);
					setPwChangeSuccess(false);
				}, 1300);
			} else setPwChangeError("Fehler beim Speichern!");
		} catch {
			setPwChangeError("Verbindungsfehler.");
		} finally {
			setPwChangeLoading(false);
		}
	};
	const handleLogout = () => {
		setActiveUserName("");
		setProfile({
			name: "",
			highScore: 0,
			gamesPlayed: 0,
			totalHits: 0
		});
		setProfileInput("");
		setPasswordInput("");
		setIsEditing(true);
	};
	(0, import_react.useEffect)(() => {
		if (!profile.name || board.length === 0) return;
		const entry = board.find((b) => b.name.toLowerCase() === profile.name.toLowerCase());
		if (entry && entry.score > profile.highScore) {
			const up = {
				...profile,
				highScore: entry.score
			};
			saveProfile$1(up);
			setProfile(up);
		}
	}, [
		board,
		profile.name,
		profile.highScore
	]);
	const engine = engineRef.current;
	const playing = hud.mode === "playing";
	const accuracy = hud.shots ? Math.round(hud.hits / hud.shots * 100) : 0;
	const min = Math.floor(hud.timeLeft / 60);
	const sec = String(Math.floor(hud.timeLeft % 60)).padStart(2, "0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-ink text-paper",
		children: [!playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-3 right-4 text-[10px] font-mono text-paper-dim/50 font-bold tracking-widest z-50 pointer-events-none",
			children: "v1.0.9 BETA"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex h-full w-full max-h-[100dvh] max-w-[100vw] items-center justify-center",
			style: { touchAction: "none" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "block max-h-full max-w-full scale-[1.08] origin-center",
					style: {
						cursor: playing ? "none" : "default",
						touchAction: "none"
					}
				}),
				hud.mode === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 flex items-center justify-center bg-ink/80 px-4 py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex max-h-full w-full max-w-lg flex-col items-center gap-4 overflow-y-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/assets/logo.png?v=2",
								alt: "Bankgeheimnis im Park",
								className: "h-auto w-[min(55vw,170px)] select-none",
								draggable: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-sm text-center text-xs italic leading-relaxed text-paper-dim",
								children: "„Ich rede von meiner kleinen Parabellum-Halbautomatik, Kaliber 9 mm, mit erweitertem Magazin unter meinem Strickzeug. Die macht euch Beine, noch bevor ihr überhaupt ‚Guli Guli Ram Sam Sam‘ singen könnt …“"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-paper uppercase",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-amber-400" }), " Profil"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs font-bold text-amber-400",
										children: [
											"Rekord: ",
											profile.highScore,
											" Pkt"
										]
									})]
								}), !isEditing && profile.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2 rounded-md border border-line bg-ink-3 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col min-w-0 max-w-[100px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[9px] text-paper-dim uppercase font-bold tracking-wider",
													children: "Eingeloggt als"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-bold text-paper truncate",
													children: [getActiveBadgeIcon(profile?.equipped) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mr-1 text-sm",
														children: getActiveBadgeIcon(profile?.equipped)
													}), profile.name]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setShowStatsModal(true),
													title: "Statistiken anzeigen",
													className: "rounded border border-line bg-ink px-1.5 py-1 text-[11px] font-bold text-paper hover:bg-ink-3",
													children: "📊 Stats"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => {
														setShowPwModal(true);
														setPwChangeError(null);
													},
													title: "Passwort ändern",
													className: "rounded border border-line bg-ink px-1.5 py-1 text-[11px] font-bold text-amber-400 hover:bg-ink-3",
													children: "🔑 PW"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: handleLogout,
												title: "Abmelden",
												className: "flex items-center gap-1 rounded border border-line bg-ink px-2 py-1 text-xs text-red-400 hover:bg-red-950/50 flex-shrink-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" }), " Abmelden"]
											})
										]
									}), !isSecured && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 border-t border-line/60 pt-2 flex flex-col gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-bold text-amber-400 flex items-center gap-1",
												children: "⚠️ Account ungesichert! Passwort festlegen:"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "password",
													maxLength: 32,
													placeholder: "Passwort (min. 4 Zeichen)",
													value: claimPassword,
													onChange: (e) => {
														setClaimPassword(e.target.value);
														setClaimError(null);
													},
													className: "h-8 flex-1 rounded border border-line bg-ink px-2 text-xs text-paper outline-none placeholder:text-muted"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: authLoading,
													onClick: handleSecureAccount,
													className: "h-8 px-3 rounded bg-amber-400 text-ink font-bold text-xs hover:bg-amber-300 disabled:opacity-50",
													children: authLoading ? "..." : "Sichern"
												})]
											}),
											claimError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] text-red-400 font-bold",
												children: ["⚠️ ", claimError]
											})
										]
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2 w-full",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											maxLength: 16,
											value: profileInput,
											onChange: (e) => {
												setProfileInput(e.target.value);
												setProfileError(null);
											},
											placeholder: "Name (min. 2 Zeichen)",
											className: "h-9 w-full rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "password",
											maxLength: 32,
											value: passwordInput,
											onChange: (e) => {
												setPasswordInput(e.target.value);
												setProfileError(null);
											},
											placeholder: "Passwort (min. 4 Zeichen)",
											className: "h-9 w-full rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: authLoading,
											onClick: handleAuth,
											className: "h-9 w-full rounded-md bg-paper font-bold text-xs text-ink hover:bg-paper/90 disabled:opacity-50",
											children: authLoading ? "Prüfe..." : "Einloggen / Registrieren"
										}),
										profileError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded",
											children: ["⚠️ ", profileError]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 shadow-xl my-3",
								children: [profile.name && !isEditing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-b border-neutral-800/60 pb-3 mb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setIsMissionsOpen(true),
										onTouchEnd: (e) => {
											e.stopPropagation();
											setIsMissionsOpen(true);
										},
										className: "w-full flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 px-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-base",
												children: "🎯"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm",
												children: "Park-Missionen"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30 font-mono",
											children: [
												missions.filter((m) => m.claimed).length,
												" / ",
												missions.length,
												" Erledigt"
											]
										})]
									}), (() => {
										const dailyStatus = getDailyRewardStatus(profile);
										const canClaim = Boolean(dailyStatus.canClaim);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setIsDailyRewardOpen(true),
											onTouchEnd: (e) => {
												e.stopPropagation();
												setIsDailyRewardOpen(true);
											},
											className: "mt-2.5 w-full flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 py-3 px-3.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-base",
													children: "🎁"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm",
													children: "7-Tage Login-Bonus"
												})]
											}), canClaim ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse shadow",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-white animate-ping" }), "ABHOLEN!"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] text-neutral-400 font-medium font-mono",
												children: [
													"Tag ",
													dailyStatus.streak,
													"/7 ✓"
												]
											})]
										});
									})()]
								}), profile.name && !isEditing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setKioskTab("shop");
											setIsKioskOpen(true);
										},
										onTouchEnd: (e) => {
											e.stopPropagation();
											setKioskTab("shop");
											setIsKioskOpen(true);
										},
										className: "flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 px-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🏪" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kiosk" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setKioskTab("inventory");
											setHasHandbagNotification(false);
											setIsKioskOpen(true);
										},
										onTouchEnd: (e) => {
											e.stopPropagation();
											setKioskTab("inventory");
											setHasHandbagNotification(false);
											setIsKioskOpen(true);
										},
										className: "relative flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 py-2.5 px-3 text-xs font-bold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all shadow-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👜" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Handtasche (",
												getOwnedItemsCount(profile?.inventory),
												")"
											] }),
											hasHandbagNotification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "absolute -top-1 -right-1 flex h-3 w-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-neutral-900" })]
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !hud.ready,
								onClick: () => {
									unlockAudio();
									engine?.start();
								},
								className: primaryBtn,
								children: hud.ready ? "🎮 JETZT SPIELEN" : "Laden…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-bold tracking-[0.14em] text-paper uppercase",
											children: ["🏆 ", showAllScores ? "Top 100 Rangliste" : "Top 5 Bestenliste"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex rounded-md border border-line overflow-hidden",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setBoardTab("highscore"),
												className: `px-2 py-0.5 text-[10px] font-bold ${boardTab === "highscore" ? "bg-amber-500 text-ink" : "bg-ink text-paper-dim"}`,
												children: "Rekord"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setBoardTab("xp"),
												className: `px-2 py-0.5 text-[10px] font-bold ${boardTab === "xp" ? "bg-amber-500 text-ink" : "bg-ink text-paper-dim"}`,
												children: "XP"
											})]
										}),
										board.length > 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowAllScores(!showAllScores),
											className: "text-[11px] font-semibold text-amber-400 underline hover:text-amber-300",
											children: showAllScores ? "Top 5" : "Alle 100"
										})
									]
								}), board.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: `space-y-1 text-xs text-paper-dim ${showAllScores ? "max-h-64 overflow-y-auto pr-1" : ""}`,
									children: board.slice(0, showAllScores ? 100 : 5).map((row, i) => {
										const isGold = i === 0;
										const isSilver = i === 1;
										const isBronze = i === 2;
										const isMe = Boolean(profile.name && row.name.trim().toLowerCase() === profile.name.trim().toLowerCase());
										const rank = getOmaRank(row.score);
										const rankEmoji = rank.title.split(" ")[0] || "🧶";
										let itemStyle = "flex items-center justify-between py-1 px-2 rounded-md transition-all ";
										if (isMe) itemStyle += "ring-2 ring-amber-400 bg-amber-500/25 border border-amber-400 text-amber-200 font-bold shadow-md ";
										else if (isGold) itemStyle += "bg-amber-500/20 border border-amber-400/60 text-amber-300 font-bold";
										else if (isSilver) itemStyle += "bg-slate-300/15 border border-slate-300/40 text-slate-200 font-semibold";
										else if (isBronze) itemStyle += "bg-orange-700/20 border border-orange-500/40 text-orange-300 font-medium";
										else itemStyle += "border-b border-line/30 text-paper-dim";
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											onClick: () => setInspectedPlayer(row),
											className: itemStyle + " cursor-pointer active:scale-95 hover:opacity-90",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5 truncate",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "w-6 font-mono font-bold text-center",
														children: isGold ? "🥇 1." : isSilver ? "🥈 2." : isBronze ? "🥉 3." : `${i + 1}.`
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm select-none",
														title: rank.title,
														children: rankEmoji
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `truncate ${isMe ? "text-amber-300 font-bold" : "text-paper"}`,
														children: row.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 select-none",
														children: ["Lv.", getPlayerLevel(row.totalXp || row.total_xp || row.score)]
													}),
													isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "rounded bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-ink uppercase tracking-wider shadow",
														children: "DU"
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `font-mono font-bold ${isMe ? "text-amber-300" : isGold ? "text-amber-400" : isSilver ? "text-slate-200" : isBronze ? "text-orange-400" : "text-amber-400/90"}`,
												children: boardTab === "xp" ? (row.totalXp || row.score) + " XP" : row.score + " Pkt"
											})]
										}, `${row.name}-${i}-${row.score}`);
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "py-2 text-center text-xs text-muted",
									children: "Lade Rangliste…"
								})]
							}),
							!isEditing && profile?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg flex flex-col mb-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 text-xs font-bold tracking-[0.14em] text-paper uppercase flex items-center gap-1.5",
										children: "💬 Parkbank-Chat"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										ref: chatRef,
										className: "max-h-40 overflow-y-auto space-y-1.5 mb-2 bg-ink-2/50 rounded-md p-2 border border-line/30 flex flex-col",
										children: chatMsgs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted text-center mt-4",
											children: "Noch keine Nachrichten..."
										}) : chatMsgs.map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs leading-snug break-words",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: msg.name === profile.name ? "text-amber-400 font-bold" : "text-paper-dim font-bold",
													children: [msg.name, ":"]
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-paper",
													children: msg.text
												})
											]
										}, i))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										className: "flex gap-2",
										onSubmit: async (e) => {
											e.preventDefault();
											const txt = chatInput.trim();
											if (!txt) return;
											setChatInput("");
											setChatMsgs((prev) => [...prev, {
												name: profile.name,
												text: txt
											}]);
											try {
												await fetch("https://lforuvtpskrnydlburpt.supabase.co/rest/v1/chat_messages", {
													method: "POST",
													headers: {
														"Content-Type": "application/json",
														apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY",
														Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY"
													},
													body: JSON.stringify({
														name: profile.name,
														text: txt
													})
												});
											} catch (e) {}
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											maxLength: 100,
											value: chatInput,
											onChange: (e) => setChatInput(e.target.value),
											placeholder: "Nachricht...",
											className: "h-9 flex-1 rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted focus:border-paper"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "submit",
											className: "h-9 rounded-md bg-paper px-3 text-xs font-bold text-ink hover:bg-paper/90",
											children: "Senden"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "w-full max-w-sm space-y-1 rounded-xl border border-line bg-ink/60 p-3 text-xs text-paper-dim",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🧶 Stricknadelkommando" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted",
												children: "(5er Combo)"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-paper",
											children: "5s Dauerfeuer (0 Fehl-Abzug)"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🤯 Wallah, kopfschuss!",
										value: "2× Pkt + 50"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🛴 Bahndidos auf dem Roller",
										value: "200 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "✨ Talahin auf fliegendem Teppich",
										value: "150 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🛢️ Hippie in Tonne (offen)",
										value: "150 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🚫 Tonne geschlossen (Vorsicht!)",
										value: "-50 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🌳 Hinterm Baum / im Busch",
										value: "18–32 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🧢 Talahons im Park",
										value: "8–35 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "🧥 Opa Spaziergänger (Vorsicht!)",
										value: "-50 Pkt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRow, {
										label: "❌ Fehlschuss ins Leere",
										value: "-15 Pkt"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted",
								children: "Klicken/Tippen zum Zielen · Im Kommando gedrückt halten · Esc Pause"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 text-center mt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 text-[11px] font-bold tracking-[0.14em] text-paper-dim uppercase",
										children: "BANKGEHEIMNIS IM PARK"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-center gap-x-4 gap-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "https://www.tiktok.com/@bankgeheimnisimpark",
												target: "_blank",
												rel: "noopener noreferrer",
												className: "text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors",
												children: "🎵 TikTok"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "https://www.facebook.com/bankgeheimnisimpark",
												target: "_blank",
												rel: "noopener noreferrer",
												className: "text-[11px] font-semibold text-blue-500 hover:text-blue-400 transition-colors",
												children: "📘 Facebook"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "https://www.instagram.com/bankgeheimnisimpark",
												target: "_blank",
												rel: "noopener noreferrer",
												className: "text-[11px] font-semibold text-pink-500 hover:text-pink-400 transition-colors",
												children: "📸 Instagram"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "https://www.youtube.com/@bankgeheimnisimpark",
												target: "_blank",
												rel: "noopener noreferrer",
												className: "text-[11px] font-semibold text-red-500 hover:text-red-400 transition-colors",
												children: "▶ YouTube"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: async () => {
											const title = "Talahons im Park - Parabellum Edition";
											const text = "Hilf Omma bei der Parkreinigung und knack den Highscore! 🧶💥";
											const url = window.location.href;
											try {
												let shared = false;
												try {
													const imgRes = await fetch("/logo.png");
													if (imgRes.ok) {
														const blob = await imgRes.blob();
														const file = new File([blob], "talahons-im-park.png", { type: "image/png" });
														if (navigator.canShare && navigator.canShare({ files: [file] })) {
															await navigator.share({
																title,
																text: `${title}\n\n${text}\n${url}`,
																files: [file]
															});
															shared = true;
														}
													}
												} catch {}
												if (!shared) {
													if (navigator.share) await navigator.share({
														title,
														text,
														url
													});
													else {
														await navigator.clipboard.writeText(url);
														alert("Link kopiert!");
													}
												}
											} catch (e) {}
										},
										className: "mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-line bg-ink-2 py-2 text-[11px] font-bold tracking-[0.14em] text-paper transition-all hover:bg-paper hover:text-ink uppercase shadow-md",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Spiel Teilen"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-md bg-ink-3/50 p-3 text-center text-xs text-paper-dim border border-line/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5 font-bold text-paper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-emerald-400" }), " Als App installieren"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"Tippe im Menü deines Browsers auf",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "\"Zum Startbildschirm hinzufügen\"" }),
											"."
										] })]
									})
								]
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
								large: true,
								urgent: hud.timeLeft <= 10 && playing
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
				(showStatsModal || inspectedPlayer) && (() => {
					const statsTarget = inspectedPlayer ? {
						name: inspectedPlayer.name,
						totalXp: inspectedPlayer.totalXp || inspectedPlayer.total_xp || inspectedPlayer.score || 0,
						gamesPlayed: inspectedPlayer.gamesPlayed || 0,
						totalHits: inspectedPlayer.totalHits || 0,
						highScore: inspectedPlayer.score || 0,
						equipped: inspectedPlayer.equipped || {}
					} : profile;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full max-w-sm flex-col items-center rounded-2xl border border-line bg-ink p-6 text-center shadow-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-3xl tracking-wide text-paper",
									children: "📊 Statistik"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-paper-dim",
									children: ["Spieler: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-amber-400",
										children: [getActiveBadgeIcon(statsTarget?.equipped) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mr-1 text-sm",
											children: getActiveBadgeIcon(statsTarget?.equipped)
										}), statsTarget.name]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "my-5 w-full rounded-xl border border-line bg-ink-3 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "grid grid-cols-2 gap-y-3 text-left text-xs sm:text-sm text-paper-dim",
										children: [
											(() => {
												const prog = getLevelProgress(statsTarget.totalXp || 0);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
														className: "text-amber-300 font-bold",
														children: "Aktuelles Level"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
														className: "text-right font-mono font-bold text-amber-400 text-sm",
														children: ["Lv. ", prog.level]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Gesamt-Erfahrung" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
														className: "text-right font-mono font-bold text-paper",
														children: [prog.currentXp, " XP"]
													})
												] });
											})(),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Rekord" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: "text-right font-mono font-bold text-amber-400",
												children: [statsTarget.highScore || 0, " Pkt"]
											}),
											!inspectedPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Gespielte Runden" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "text-right font-mono font-bold text-paper",
													children: statsTarget.gamesPlayed || 0
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Gesamte Treffer" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "text-right font-mono font-bold text-paper",
													children: statsTarget.totalHits || 0
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Ø Treffer / Runde" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "text-right font-mono font-bold text-paper",
													children: statsTarget.gamesPlayed > 0 ? Math.round(statsTarget.totalHits / statsTarget.gamesPlayed) : 0
												})
											] })
										]
									}), !inspectedPlayer && (() => {
										const prog = getLevelProgress(statsTarget.totalXp || 0);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 pt-3 border-t border-line/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-[11px] mb-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-paper-dim",
													children: ["Fortschritt zu Lv. ", prog.level + 1]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-amber-400 font-bold",
													children: [
														prog.progressInLevel,
														" / ",
														prog.needed,
														" XP (",
														prog.percent,
														"%)"
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-2.5 w-full overflow-hidden rounded-full bg-ink border border-line",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full",
													style: { width: `${prog.percent}%` }
												})
											})]
										});
									})()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setShowStatsModal(false);
										setInspectedPlayer(null);
									},
									className: primaryBtn,
									children: "Schließen"
								})
							]
						})
					});
				})(),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskModal, {
					isOpen: isKioskOpen,
					initialTab: kioskTab,
					profile,
					onClose: () => setIsKioskOpen(false),
					onUpdateProfile: (updated) => {
						setProfile(updated);
						saveProfile$1(updated);
						syncProfileOnline(updated).catch(console.error);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyRewardModal, {
					isOpen: isDailyRewardOpen,
					onClose: () => setIsDailyRewardOpen(false),
					profile,
					onClaim: () => {
						const status = getDailyRewardStatus(profile);
						if (!status.canClaim) return;
						const dayNumber = status.canClaim;
						const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
						const r = {
							1: {
								coins: 3,
								xp: 0
							},
							2: {
								coins: 0,
								xp: 100
							},
							3: {
								coins: 6,
								xp: 0
							},
							4: {
								coins: 0,
								xp: 100
							},
							5: {
								coins: 6,
								xp: 100
							},
							6: {
								coins: 10,
								xp: 0
							},
							7: {
								coins: 0,
								xp: 0,
								badge: "badge_tauben"
							}
						}[dayNumber] || {
							coins: 1,
							xp: 0
						};
						setProfile((p) => {
							const currentCoins = Number(p.coins) || 0;
							const currentXp = Number(p.totalXp) || 0;
							const currentInv = Array.isArray(p.inventory) ? [...p.inventory] : [];
							const currentEquipped = { ...p.equipped || {} };
							if (r.badge) {
								if (!currentInv.includes(r.badge)) currentInv.push(r.badge);
								currentEquipped.badge = r.badge;
							}
							const updated = {
								...p,
								coins: currentCoins + r.coins,
								totalXp: currentXp + r.xp,
								inventory: currentInv,
								equipped: currentEquipped,
								dailyReward: {
									streak: dayNumber,
									lastClaimDate: today
								}
							};
							try {
								localStorage.setItem("park_profile", JSON.stringify(updated));
								if (typeof saveProfile$1 === "function") saveProfile$1(updated);
								if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
							} catch (err) {
								console.error(err);
							}
							return updated;
						});
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionsModal, {
					onClaimLaser: () => {
						setProfile((prev) => {
							const inv = Array.isArray(prev.inventory) ? prev.inventory : [];
							if (inv.includes("visier_neon")) return prev;
							const updatedInv = [...inv, "visier_neon"];
							const updatedEquipped = {
								...prev.equipped || {},
								visier: "visier_neon"
							};
							const updated = {
								...prev,
								inventory: updatedInv,
								equipped: updatedEquipped
							};
							try {
								localStorage.setItem("park_profile", JSON.stringify(updated));
								if (typeof saveProfile$1 === "function") saveProfile$1(updated);
								if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
							} catch {}
							return updated;
						});
					},
					isOpen: isMissionsOpen,
					onClaimAll: () => {
						const claimables = missions.filter((m) => m.completed && !m.claimed);
						if (claimables.length === 0) return;
						const totalAdd = claimables.reduce((acc, m) => acc + m.rewardCoins, 0);
						const next = missions.map((m) => m.completed ? {
							...m,
							claimed: true
						} : m);
						setMissions(next);
						setProfile((p) => {
							const updatedCoins = (p.coins || 0) + totalAdd;
							const updated = {
								...p,
								coins: updatedCoins,
								missions: next
							};
							try {
								localStorage.setItem("park_profile", JSON.stringify(updated));
								if (typeof saveProfile$1 === "function") saveProfile$1(updated);
								if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
							} catch {}
							return updated;
						});
					},
					onClose: () => setIsMissionsOpen(false),
					missions,
					onClaim: (id) => {
						const next = missions.map((m) => m.id === id ? {
							...m,
							claimed: true
						} : m);
						setMissions(next);
						setProfile((p) => {
							const rewardItem = missions.find((m) => m.id === id);
							const addCoins = rewardItem ? rewardItem.rewardCoins : 2;
							const updatedCoins = (p.coins || 0) + addCoins;
							const updated = {
								...p,
								coins: updatedCoins,
								missions: next
							};
							try {
								localStorage.setItem("park_profile", JSON.stringify(updated));
								if (typeof saveProfile$1 === "function") saveProfile$1(updated);
								if (typeof syncProfileOnline === "function") syncProfileOnline(updated);
							} catch {}
							return updated;
						});
					},
					allCompleted: missions.every((m) => m.claimed || m.completed),
					laserClaimed: Array.isArray(profile.inventory) && profile.inventory.includes("visier_neon")
				}),
				showPwModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full max-w-sm flex-col items-center rounded-2xl border border-line bg-ink p-6 text-center shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl tracking-wide text-paper",
								children: "🔑 Passwort ändern"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-paper-dim",
								children: ["Spieler: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-amber-400",
									children: [getActiveBadgeIcon(profile?.equipped) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-1 text-sm",
										children: getActiveBadgeIcon(profile?.equipped)
									}), profile.name]
								})]
							}),
							pwChangeSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "my-5 w-full rounded-lg border border-emerald-600 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-300",
								children: "✅ Passwort erfolgreich geändert!"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-4 flex flex-col gap-2.5 w-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "password",
										maxLength: 32,
										value: oldPwInput,
										onChange: (e) => {
											setOldPwInput(e.target.value);
											setPwChangeError(null);
										},
										placeholder: "Altes Passwort",
										className: "h-9 w-full rounded-md border border-line bg-ink-3 px-3 text-xs text-paper outline-none placeholder:text-muted"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "password",
										maxLength: 32,
										value: newPwInput,
										onChange: (e) => {
											setNewPwInput(e.target.value);
											setPwChangeError(null);
										},
										placeholder: "Neues Passwort (min. 4 Zeichen)",
										className: "h-9 w-full rounded-md border border-line bg-ink-3 px-3 text-xs text-paper outline-none placeholder:text-muted"
									}),
									pwChangeError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded",
										children: ["⚠️ ", pwChangeError]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex gap-2 w-full",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: pwChangeLoading,
											onClick: handleChangePassword,
											className: "h-10 flex-1 rounded-md bg-amber-400 font-bold text-xs text-ink hover:bg-amber-300 disabled:opacity-50",
											children: pwChangeLoading ? "..." : "Speichern"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setShowPwModal(false);
												setPwChangeError(null);
											},
											className: "h-10 px-4 rounded-md border border-line bg-ink-3 text-xs font-bold text-paper hover:bg-ink",
											children: "Abbrechen"
										})]
									})
								]
							})
						]
					})
				}),
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
				hud.mode === "results" && resultsDelay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-6 animate-bounce text-7xl drop-shadow-2xl",
						children: "🎉✨🎊"
					}), (() => {
						const rank = getOmaRank(hud.score);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `w-full max-w-sm rounded-xl border p-5 text-center shadow-2xl ${rank.color}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-bold tracking-[0.14em] uppercase opacity-80",
									children: "Dein erreichter Rang"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-2xl font-black tracking-wide",
									children: rank.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed opacity-90",
									children: rank.desc
								})
							]
						});
					})()]
				}),
				hud.mode === "results" && !resultsDelay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl tracking-wide",
						children: "Runde vorbei"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex flex-col items-center justify-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-5xl tabular-nums tracking-wide text-amber-400",
									children: [hud.score.toLocaleString(), " PKT"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black animate-pulse",
									children: ["+", endXpDisplay.gained.toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-1.5 text-xs text-paper-dim",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gesamt:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-bold text-white tabular-nums text-sm",
									children: [endXpDisplay.liveTotal.toLocaleString(), " XP"]
								})]
							}),
							endXpDisplay.newLevel > endXpDisplay.oldLevel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-400 bg-amber-500/20 text-yellow-300 text-xs font-black animate-bounce shadow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"🎉 NEUES LEVEL ",
									endXpDisplay.newLevel,
									"!"
								] })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:text-sm text-paper-dim",
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
							})
						]
					}),
					(() => {
						const rank = getOmaRank(hud.score);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `mt-3 w-full max-w-xs rounded-xl border p-3 text-center ${rank.color}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-bold tracking-[0.14em] uppercase opacity-80",
									children: "Dein erreichter Rang"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-base font-black tracking-wide",
									children: rank.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-snug opacity-90",
									children: rank.desc
								})
							]
						});
					})(),
					!named ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex w-full max-w-xs flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex flex-col gap-2",
							onSubmit: async (e) => {
								e.preventDefault();
								const cl = name.trim();
								if (!cl || cl.length < 2) return setNameError("Mindestens 2 Zeichen!");
								if ((await fetchOnlineBoard()).some((x) => x.name.toLowerCase() === cl.toLowerCase() && cl.toLowerCase() !== (profile.name || "").toLowerCase())) return setNameError("Name bereits vergeben!");
								setNameError(null);
								setNamed(true);
								setActiveUserName(cl);
								gameOverHandledRef.current = true;
								const base = loadProfile$1(cl);
								const nextP = {
									...base,
									name: cl,
									highScore: Math.max(base.highScore || 0, hud.score),
									gamesPlayed: (base.gamesPlayed || 0) + 1,
									totalHits: (base.totalHits || 0) + (hud.hits || 0),
									totalXp: (base.totalXp || 0) + (hud.score > 0 ? hud.score : 0)
								};
								saveProfile$1(nextP);
								setProfile(nextP);
								setProfileInput(nextP.name);
								setIsEditing(false);
								const calculatedLvl = getPlayerLevel(nextP.totalXp || 0);
								const up = await submitScore(cl, nextP.highScore, calculatedLvl);
								setBoard(up);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase",
									children: "Name für die 🏆 Bestenliste"
								}),
								nameError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-left text-xs font-bold text-red-400",
									children: ["⚠️ ", nameError]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										autoFocus: true,
										maxLength: 16,
										value: name,
										onChange: (e) => {
											setName(e.target.value);
											setNameError(null);
										},
										placeholder: "Dein Name",
										className: "h-11 flex-1 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-muted"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "h-11 rounded-md bg-paper px-4 font-semibold text-sm text-ink",
										children: "Speichern"
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setNameError(null);
								setNamed(true);
							},
							className: "h-9 rounded-md border border-line/60 bg-ink/50 text-xs text-paper-dim hover:text-paper",
							children: "Als Gast fortfahren (ohne Wertung)"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 w-full max-w-xs rounded-xl border border-line bg-ink/90 p-3 shadow-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-center text-xs font-bold tracking-[0.14em] text-paper uppercase",
							children: "🏆 Parkbank Top 10"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-1 text-xs text-paper-dim max-h-40 overflow-y-auto",
							children: board.slice(0, 10).map((row, i) => {
								const isGold = i === 0;
								const isSilver = i === 1;
								const isBronze = i === 2;
								const isMe = Boolean(profile.name && row.name.trim().toLowerCase() === profile.name.trim().toLowerCase());
								const rank = getOmaRank(row.score);
								const rankEmoji = rank.title.split(" ")[0] || "🧶";
								let itemStyle = "flex items-center justify-between py-1 px-2 rounded ";
								if (isMe) itemStyle += "ring-2 ring-amber-400 bg-amber-500/25 border border-amber-400 text-amber-200 font-bold shadow-md ";
								else if (isGold) itemStyle += "bg-amber-500/20 text-amber-300 font-bold";
								else if (isSilver) itemStyle += "bg-slate-300/15 text-slate-200 font-semibold";
								else if (isBronze) itemStyle += "bg-orange-700/20 text-orange-300 font-medium";
								else itemStyle += "border-b border-line/30 text-paper-dim";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: itemStyle,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 truncate",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-6 font-mono font-bold text-center",
												children: isGold ? "🥇 1." : isSilver ? "🥈 2." : isBronze ? "🥉 3." : `${i + 1}.`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm select-none",
												title: rank.title,
												children: rankEmoji
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `truncate ${isMe ? "text-amber-300 font-bold" : "text-paper"}`,
												children: row.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 select-none",
												children: ["Lv.", getPlayerLevel(row.totalXp || row.total_xp || row.score)]
											}),
											isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-ink uppercase tracking-wider shadow",
												children: "DU"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-amber-400/90",
										children: boardTab === "xp" ? (row.totalXp || row.score) + " XP" : row.score + " Pkt"
									})]
								}, `${row.name}-${i}-${row.score}`);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex w-full max-w-xs flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: primaryBtn,
							onClick: () => {
								engine?.start();
							},
							children: "Nochmal spielen"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: ghostBtn,
							onClick: () => {
								engine?.toTitle();
							},
							children: "Zum Menü"
						})]
					})
				] })
			]
		})]
	});
}
function HudChip({ label, value, large, urgent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex flex-col items-center rounded-lg border px-3 py-1.5 backdrop-blur-sm transition-colors ${urgent ? "border-red-500/80 bg-red-950/60" : "border-line bg-ink/70"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-[10px] font-medium tracking-[0.14em] uppercase ${urgent ? "text-red-400" : "text-paper-dim"}`,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-display tabular-nums ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"} ${urgent ? "text-red-500 animate-pulse font-bold" : "text-paper"}`,
			children: value
		})]
	});
}
function IconBtn({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "flex size-11 items-center justify-center rounded-full border border-line bg-ink/70 text-paper backdrop-blur-sm transition-transform active:scale-95",
		children
	});
}
function Modal({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-ink/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex w-full max-w-md flex-col items-center rounded-2xl border border-line bg-ink p-6 text-center shadow-2xl",
			children
		})
	});
}
function ScoreRow({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-paper",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameScreen, {});
}
//#endregion
export { stopParkAmbience as C, routes_irFl9g0__exports as E, stopOmaKommando as S, unlockAudio as T, resumeAudio as _, playMiss as a, startParkAmbience as b, playOmaLine as c, Home as component, playRoundEnd as d, playShot as f, preloadSounds as g, playVoice as h, playHit as i, playOpaSpawn as l, playTalahonHitVoice as m, isMuted as n, playOmaHitVoice as o, playTalahinIntro as p, onGameStartAudio as r, playOmaKommando as s, cancelOmaSpeech as t, playRocker as u, setMuted as v, tickChirps as w, stopAllVoices as x, setParkPaused as y };
