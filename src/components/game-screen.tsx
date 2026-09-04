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
import { Pause, Play, Volume2, VolumeX, User, Trash2, Edit2, Share2, Maximize, Minimize, Smartphone, LogOut } from "lucide-react";
import { emptyHud, GameEngine } from "@/game/engine";
import { unlockAudio } from "@/game/audio";
import { qualifies, submitScore, fetchOnlineBoard, syncPlayerLevel, type ScoreEntry } from "@/game/scores";
import { loadProfile, saveProfile, resetCurrentProfile, type PlayerProfile, setActiveUserName, getPlayerLevel, getLevelProgress } from "@/lib/profile";
import type { Hud } from "@/game/types";

const primaryBtn =
  "h-12 rounded-md bg-paper px-6 font-display text-2xl tracking-wide text-ink transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]";
const ghostBtn =
  "h-11 rounded-md border border-line px-6 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-3 hover:text-paper";

export function GameScreen() {
  const [showAllScores, setShowAllScores] = React.useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [oldPwInput, setOldPwInput] = useState("");
  const [newPwInput, setNewPwInput] = useState("");
  const [pwChangeError, setPwChangeError] = useState<string | null>(null);
  const [pwChangeSuccess, setPwChangeSuccess] = useState(false);
  const [pwChangeLoading, setPwChangeLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const gameOverHandledRef = useRef(false);
  const [hud, setHud] = useState<Hud>(emptyHud());
  const [omaLine, setOmaLine] = useState(false);
  const [board, setBoard] = useState<ScoreEntry[]>([]);
  
  const [profile, setProfile] = useState<PlayerProfile>({ name: "", highScore: 0, gamesPlayed: 0, totalHits: 0, totalXp: 0 });
  const [profileInput, setProfileInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isSecured, setIsSecured] = useState(true);
  const [claimPassword, setClaimPassword] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [chatMsgs, setChatMsgs] = useState<{name: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  
  // Auto-Sync entfernt

  useEffect(() => {
    if (!profile || !profile.name || isEditing) return;
    const fetchChat = async () => {
      try {
        const res = await fetch(`https://lforuvtpskrnydlburpt.supabase.co/rest/v1/chat_messages?select=name,text&order=created_at.desc&limit=30`, {
          headers: { apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY", Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY" }
        });
        if (res.ok) setChatMsgs((await res.json()).reverse());
      } catch (e) {}
    };
    fetchChat();
    const iv = setInterval(fetchChat, 2000);
    return () => clearInterval(iv);
  }, [profile?.name, isEditing]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMsgs]);


  const [name, setName] = useState("");
  const [named, setNamed] = useState(false);
  const [resultsDelay, setResultsDelay] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Auto-Pause
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && hud.mode === "playing") {
        engineRef.current?.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [hud.mode]);

  // Vollbild-Status überwachen
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  // Treffer-Zucken (Hitmarker-Bump)
  
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {}
  };
  

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setProfileInput(p.name);
    if (!p.name) {
      setIsEditing(true);
    }
  }, []);

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
    if (hud.mode === "playing") {
      gameOverHandledRef.current = false;
    }
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
      if (gameOverHandledRef.current) return;
      setResultsDelay(true);
      const t = window.setTimeout(() => setResultsDelay(false), 2000);

      const activeName = profile.name.trim();
      if (activeName) {
        gameOverHandledRef.current = true;
        const p = loadProfile(activeName);
        p.gamesPlayed = (p.gamesPlayed || 0) + 1;
        p.totalHits = (p.totalHits || 0) + hud.hits;
        p.totalXp = (p.totalXp || 0) + hud.score;
        if (hud.score > p.highScore) p.highScore = hud.score;
        saveProfile(p);
        setProfile(p);

        const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
        const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
        fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(activeName)}`, {
          method: "PATCH",
          headers: {
            apikey: SUPA_KEY,
            Authorization: `Bearer ${SUPA_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ stats: { gamesPlayed: p.gamesPlayed, totalHits: p.totalHits } })
        }).catch(() => {});
      }

      if (activeName) {
        setNamed(true);
        setName(activeName);
        if (hud.score > 0) {
          submitScore(activeName, hud.score, getPlayerLevel(loadProfile(activeName).totalXp)).then((up) => {
            if (up && up.length > 0) setBoard(up);
          });
        } else {
          fetchOnlineBoard().then((data) => {
            if (data && data.length > 0) setBoard(data);
          });
        }
      } else {
        setNamed(!qualifies(hud.score));
        fetchOnlineBoard().then((data) => {
          if (data && data.length > 0) setBoard(data);
        });
      }

      return () => window.clearTimeout(t);
    }
  }, [hud.mode, hud.score, hud.hits, profile.name]);

  
    // 1. Prüfen, ob der aktuell eingeloggte Name ein Passwort in Supabase hat
  useEffect(() => {
    if (!profile.name) {
      setIsSecured(true);
      return;
    }
    const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
    const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
    fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(profile.name)}&select=id`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
    })
      .then((r) => r.json())
      .then((data) => {
        setIsSecured(Array.isArray(data) && data.length > 0);
      })
      .catch(() => setIsSecured(true));
  }, [profile.name]);

  // 2. SHA-256 Hash
  const hashPassword = async (pw: string) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // 3. Ungesicherten Account nachträglich sichern
  const handleSecureAccount = async () => {
    const pw = claimPassword.trim();
    if (!pw || pw.length < 4) return setClaimError("Min. 4 Zeichen!");
    setClaimError(null);
    setAuthLoading(true);
    try {
      const pwHash = await hashPassword(pw);
      const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
      const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";
      const reg = await fetch(`${SUPA_URL}/rest/v1/accounts`, {
        method: "POST",
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ username: profile.name, password_hash: pwHash })
      });
      if (reg.ok) {
        setIsSecured(true);
        setClaimPassword("");
      } else {
        setClaimError("Sichern fehlgeschlagen.");
      }
    } catch {
      setClaimError("Server-Fehler.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Einloggen / Registrieren mit Diebstahlschutz
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
      const res = await fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(clName)}&select=username,password_hash,stats`, {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
      });
      const data = await res.json();

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
        const existingBoardScore = boardEntry ? boardEntry.score : 0;

        const reg = await fetch(`${SUPA_URL}/rest/v1/accounts`, {
          method: "POST",
          headers: {
            apikey: SUPA_KEY,
            Authorization: `Bearer ${SUPA_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({ username: clName, password_hash: pwHash })
        });
        if (!reg.ok) {
          setProfileError("Registrierung fehlgeschlagen.");
          setAuthLoading(false);
          return;
        }
      }

      const sStats = (data && data[0] && typeof data[0].stats === "object" && data[0].stats) ? data[0].stats : {};
      const ex = loadProfile(clName);

      const onlineBoard = await fetchOnlineBoard();
      const onlineEntry = onlineBoard.find((x) => x.name.toLowerCase() === clName.toLowerCase());
      const boardScore = onlineEntry ? (Number(onlineEntry.score) || 0) : 0;

      const finalHighScore = Math.max(
        ex.highScore || 0,
        boardScore,
        Number(sStats.highScore) || 0
      );

      const mergedGames = Math.max(ex.gamesPlayed || 0, Number(sStats.gamesPlayed) || 0);
      const mergedHits = Math.max(ex.totalHits || 0, Number(sStats.totalHits) || 0);

      const mergedXp = Math.max(
        ex.totalXp || 0,
        Number(sStats.totalXp) || 0,
        finalHighScore
      );

      const up = {
        name: clName,
        highScore: finalHighScore,
        gamesPlayed: mergedGames,
        totalHits: mergedHits,
        totalXp: mergedXp
      };

      saveProfile(up);
      setProfile(up);
      setPasswordInput("");
      setIsEditing(false);
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
      const res = await fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(profile.name)}&select=password_hash`, {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
      });
      const data = await res.json();
      if (!data || data.length === 0 || data[0].password_hash !== oldHash) {
        setPwChangeError("Altes Passwort ist falsch!");
        setPwChangeLoading(false);
        return;
      }
      const newHash = await hashPassword(newPw);
      const patchRes = await fetch(`${SUPA_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(profile.name)}`, {
        method: "PATCH",
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ password_hash: newHash })
      });
      if (patchRes.ok) {
        setPwChangeSuccess(true);
        setOldPwInput("");
        setNewPwInput("");
        setTimeout(() => { setShowPwModal(false); setPwChangeSuccess(false); }, 1300);
      } else {
        setPwChangeError("Fehler beim Speichern!");
      }
    } catch {
      setPwChangeError("Verbindungsfehler.");
    } finally {
      setPwChangeLoading(false);
    }
  };

  const handleLogout = () => {
    setActiveUserName("");
    setProfile({ name: "", highScore: 0, gamesPlayed: 0, totalHits: 0 });
    setProfileInput("");
    setPasswordInput("");
    setIsEditing(true);
  };

  const handleDeleteProfile = () => {
    if (typeof window !== "undefined" && !window.confirm("Möchtest du das Profil wirklich zurücksetzen?")) {
      return;
    }
    const empty = resetCurrentProfile();
    setProfile(empty);
    setProfileInput("");
    setIsEditing(true);
  };

  useEffect(() => {
    if (!profile.name || board.length === 0) return;
    const entry = board.find((b) => b.name.toLowerCase() === profile.name.toLowerCase());
    if (entry && entry.score > profile.highScore) {
      const up = { ...profile, highScore: entry.score };
      saveProfile(up);
      setProfile(up);
    }
  }, [board, profile.name, profile.highScore]);

  const engine = engineRef.current;
  const playing = hud.mode === "playing";
  const accuracy = hud.shots ? Math.round((hud.hits / hud.shots) * 100) : 0;
  const min = Math.floor(hud.timeLeft / 60);
  const sec = String(Math.floor(hud.timeLeft % 60)).padStart(2, "0");
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-ink text-paper">
      {!playing && <div className="absolute top-3 right-4 text-[10px] font-mono text-paper-dim/50 font-bold tracking-widest z-50 pointer-events-none">v1.0.5 BETA</div>}
      <div
        className="relative flex h-full w-full max-h-[100dvh] max-w-[100vw] items-center justify-center"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="block max-h-full max-w-full scale-[1.08] origin-center"
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

              {/* Spieler & Rekord Box */}
              <div className="w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-paper uppercase">
                    <User className="size-3.5 text-amber-400" /> Profil
                  </p>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    Rekord: {profile.highScore} Pkt
                  </span>
                </div>

                {!isEditing && profile.name ? (
                  <div className="flex flex-col gap-2 rounded-md border border-line bg-ink-3 px-3 py-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex flex-col min-w-0 max-w-[100px]">
                        <span className="text-[9px] text-paper-dim uppercase font-bold tracking-wider">Eingeloggt als</span>
                        <span className="text-xs font-bold text-paper truncate">{profile.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowStatsModal(true)}
                          title="Statistiken anzeigen"
                          className="rounded border border-line bg-ink px-1.5 py-1 text-[11px] font-bold text-paper hover:bg-ink-3"
                        >
                          📊 Stats
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowPwModal(true); setPwChangeError(null); }}
                          title="Passwort ändern"
                          className="rounded border border-line bg-ink px-1.5 py-1 text-[11px] font-bold text-amber-400 hover:bg-ink-3"
                        >
                          🔑 PW
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        title="Abmelden"
                        className="flex items-center gap-1 rounded border border-line bg-ink px-2 py-1 text-xs text-red-400 hover:bg-red-950/50 flex-shrink-0"
                      >
                        <LogOut className="size-3.5" /> Abmelden
                      </button>
                    </div>

                    {!isSecured && (
                      <div className="mt-1 border-t border-line/60 pt-2 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          ⚠️ Account ungesichert! Passwort festlegen:
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            type="password"
                            maxLength={32}
                            placeholder="Passwort (min. 4 Zeichen)"
                            value={claimPassword}
                            onChange={(e) => { setClaimPassword(e.target.value); setClaimError(null); }}
                            className="h-8 flex-1 rounded border border-line bg-ink px-2 text-xs text-paper outline-none placeholder:text-muted"
                          />
                          <button
                            type="button"
                            disabled={authLoading}
                            onClick={handleSecureAccount}
                            className="h-8 px-3 rounded bg-amber-400 text-ink font-bold text-xs hover:bg-amber-300 disabled:opacity-50"
                          >
                            {authLoading ? "..." : "Sichern"}
                          </button>
                        </div>
                        {claimError && (
                          <span className="text-[10px] text-red-400 font-bold">⚠️ {claimError}</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      type="text"
                      maxLength={16}
                      value={profileInput}
                      onChange={(e) => { setProfileInput(e.target.value); setProfileError(null); }}
                      placeholder="Name (min. 2 Zeichen)"
                      className="h-9 w-full rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
                    />
                    <input
                      type="password"
                      maxLength={32}
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setProfileError(null); }}
                      placeholder="Passwort (min. 4 Zeichen)"
                      className="h-9 w-full rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
                    />
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={handleAuth}
                      className="h-9 w-full rounded-md bg-paper font-bold text-xs text-ink hover:bg-paper/90 disabled:opacity-50"
                    >
                      {authLoading ? "Prüfe..." : "Einloggen / Registrieren"}
                    </button>
                    {profileError && (
                      <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded">
                        ⚠️ {profileError}
                      </p>
                    )}
                  </div>
                )}
              </div>

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

              {/* Highscore Liste */}
              <div className="w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg">
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
                  <ol className={`space-y-1 text-xs text-paper-dim ${showAllScores ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
                    {board.slice(0, showAllScores ? 100 : 5).map((row, i) => {
                      const isGold = i === 0;
                      const isSilver = i === 1;
                      const isBronze = i === 2;
                      const isMe = Boolean(profile.name && row.name.trim().toLowerCase() === profile.name.trim().toLowerCase());
                      const rank = getOmaRank(row.score);
                      const rankEmoji = rank.title.split(" ")[0] || "🧶";

                      let itemStyle = "flex items-center justify-between py-1 px-2 rounded-md transition-all ";
                      if (isMe) {
                        itemStyle += "ring-2 ring-amber-400 bg-amber-500/25 border border-amber-400 text-amber-200 font-bold shadow-md ";
                      } else if (isGold) {
                        itemStyle += "bg-amber-500/20 border border-amber-400/60 text-amber-300 font-bold";
                      } else if (isSilver) {
                        itemStyle += "bg-slate-300/15 border border-slate-300/40 text-slate-200 font-semibold";
                      } else if (isBronze) {
                        itemStyle += "bg-orange-700/20 border border-orange-500/40 text-orange-300 font-medium";
                      } else {
                        itemStyle += "border-b border-line/30 text-paper-dim";
                      }

                      return (
                        <li key={`${row.name}-${i}-${row.score}`} className={itemStyle}>
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="w-6 font-mono font-bold text-center">
                              {isGold ? "🥇 1." : isSilver ? "🥈 2." : isBronze ? "🥉 3." : `${i + 1}.`}
                            </span>
                            <span className="text-sm select-none" title={rank.title}>{rankEmoji}</span>
                            <span className={`truncate ${isMe ? "text-amber-300 font-bold" : "text-paper"}`}>{row.name}</span>
                            <span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 select-none">Lv.{row.level || 1}</span>
                            {isMe && (
                              <span className="rounded bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-ink uppercase tracking-wider shadow">
                                DU
                              </span>
                            )}
                          </span>
                          <span className={`font-mono font-bold ${isMe ? "text-amber-300" : isGold ? "text-amber-400" : isSilver ? "text-slate-200" : isBronze ? "text-orange-400" : "text-amber-400/90"}`}>
                            {row.score} Pkt
                          </span>
                        </li>
                      );
                    })}</ol>
                ) : (
                  <p className="py-2 text-center text-xs text-muted">Lade Rangliste…</p>
                )}
              </div>

              
              {/* Chat-Bereich (Nur sichtbar wenn Name gesetzt) */}
              {!isEditing && profile?.name && (
                <div className="w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg flex flex-col mb-4">
                  <p className="mb-2 text-xs font-bold tracking-[0.14em] text-paper uppercase flex items-center gap-1.5">
                    💬 Parkbank-Chat
                  </p>
                  <div ref={chatRef} className="max-h-40 overflow-y-auto space-y-1.5 mb-2 bg-ink-2/50 rounded-md p-2 border border-line/30 flex flex-col">
                    {chatMsgs.length === 0 ? (
                      <p className="text-xs text-muted text-center mt-4">Noch keine Nachrichten...</p>
                    ) : (
                      chatMsgs.map((msg, i) => (
                        <div key={i} className="text-xs leading-snug break-words">
                          <span className={msg.name === profile.name ? "text-amber-400 font-bold" : "text-paper-dim font-bold"}>{msg.name}:</span>{" "}
                          <span className="text-paper">{msg.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form className="flex gap-2" onSubmit={async (e) => {
                    e.preventDefault();
                    const txt = chatInput.trim();
                    if (!txt) return;
                    setChatInput("");
                    
                    setChatMsgs(prev => [...prev, {name: profile.name, text: txt}]);
                    
                    try {
                      await fetch("https://lforuvtpskrnydlburpt.supabase.co/rest/v1/chat_messages", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY", Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY" },
                        body: JSON.stringify({ name: profile.name, text: txt })
                      });
                    } catch (e) {}
                  }}>
                    <input
                      type="text"
                      maxLength={100}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Nachricht..."
                      className="h-9 flex-1 rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted focus:border-paper"
                    />
                    <button type="submit" className="h-9 rounded-md bg-paper px-3 text-xs font-bold text-ink hover:bg-paper/90">
                      Senden
                    </button>
                  </form>
                </div>
              )}

              {/* Spielanleitung */}
              <ul className="w-full max-w-sm space-y-1 rounded-xl border border-line bg-ink/60 p-3 text-xs text-paper-dim">
                <li className="flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span>🧶 Stricknadelkommando</span>
                    <span className="text-[10px] text-muted">(5er Combo)</span>
                  </div>
                  <span className="font-semibold text-paper">5s Dauerfeuer (0 Fehl-Abzug)</span>
                </li>
                <ScoreRow label="🤯 Wallah, kopfschuss!" value="2× Pkt + 50" />
                <ScoreRow label="🛴 Bahndidos auf dem Roller" value="200 Pkt" />
                <ScoreRow label="✨ Talahin auf fliegendem Teppich" value="150 Pkt" />
                <ScoreRow label="🛢️ Hippie in Tonne (offen)" value="150 Pkt" />
                <ScoreRow label="🚫 Tonne geschlossen (Vorsicht!)" value="-50 Pkt" />
                <ScoreRow label="🌳 Hinterm Baum / im Busch" value="18–32 Pkt" />
                <ScoreRow label="🧢 Talahons im Park" value="8–35 Pkt" />
                <ScoreRow label="🧥 Opa Spaziergänger (Vorsicht!)" value="-50 Pkt" />
                <ScoreRow label="❌ Fehlschuss ins Leere" value="-15 Pkt" />
              </ul>

              <p className="text-[11px] text-muted">
                Klicken/Tippen zum Zielen · Im Kommando gedrückt halten · Esc Pause
              </p>

              {/* Social Media Links */}
              <div className="w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 text-center mt-2">
                <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-paper-dim uppercase">BANKGEHEIMNIS IM PARK</p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  <a href="https://www.tiktok.com/@bankgeheimnisimpark" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                    🎵 TikTok
                  </a>
                  <a href="https://www.facebook.com/bankgeheimnisimpark" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                    📘 Facebook
                  </a>
                  <a href="https://www.instagram.com/bankgeheimnisimpark" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-pink-500 hover:text-pink-400 transition-colors">
                    📸 Instagram
                  </a>
                  <a href="https://www.youtube.com/@bankgeheimnisimpark" target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-red-500 hover:text-red-400 transition-colors">
                    ▶ YouTube
                  </a>
                </div>
                <button
                  type="button"
                  onClick={async () => {
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
                            await navigator.share({ title, text: `${title}\n\n${text}\n${url}`, files: [file] });
                            shared = true;
                          }
                        }
                      } catch {}
                      if (!shared) {
                        if (navigator.share) {
                          await navigator.share({ title, text, url });
                        } else {
                          await navigator.clipboard.writeText(url);
                          alert("Link kopiert!");
                        }
                      }
                    } catch (e) {}
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-line bg-ink-2 py-2 text-[11px] font-bold tracking-[0.14em] text-paper transition-all hover:bg-paper hover:text-ink uppercase shadow-md"
                >
                  <Share2 className="size-4" />
                  Spiel Teilen
                </button>

                <div className="mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-md bg-ink-3/50 p-3 text-center text-xs text-paper-dim border border-line/50">
                  <span className="flex items-center gap-1.5 font-bold text-paper">
                    <Smartphone className="size-4 text-emerald-400" /> Als App installieren
                  </span>
                  <span>Tippe im Menü deines Browsers auf<br/><b>"Zum Startbildschirm hinzufügen"</b>.</span>
                </div>
              </div>
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
                {hud.mode === "paused" ? <Play className="size-5" /> : <Pause className="size-5" />}
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

        
        {showStatsModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-line bg-ink p-6 text-center shadow-2xl">
              <p className="font-display text-3xl tracking-wide text-paper">📊 Statistik</p>
              <p className="mt-1 text-xs text-paper-dim">
                Spieler: <span className="font-bold text-amber-400">{profile.name}</span>
              </p>
              <div className="my-5 w-full rounded-xl border border-line bg-ink-3 p-4">
                <dl className="grid grid-cols-2 gap-y-3 text-left text-xs sm:text-sm text-paper-dim">
                  {(() => {
                    const prog = getLevelProgress(Math.max(profile.totalXp || 0, profile.highScore || 0));
                    return (
                      <>
                        <dt className="text-amber-300 font-bold">Aktuelles Level</dt>
                        <dd className="text-right font-mono font-bold text-amber-400 text-sm">Lv. {prog.level}</dd>
                        <dt>Gesamt-Erfahrung</dt>
                        <dd className="text-right font-mono font-bold text-paper">{prog.currentXp} XP</dd>
                      </>
                    );
                  })()}
                  <dt>Gespielte Runden</dt>
                  <dd className="text-right font-mono font-bold text-paper">{profile.gamesPlayed || 0}</dd>
                  <dt>Gesamte Treffer</dt>
                  <dd className="text-right font-mono font-bold text-paper">{profile.totalHits || 0}</dd>
                  <dt>Rekord</dt>
                  <dd className="text-right font-mono font-bold text-amber-400">{profile.highScore || 0} Pkt</dd>
                  <dt>Ø Treffer / Runde</dt>
                  <dd className="text-right font-mono font-bold text-paper">
                    {profile.gamesPlayed > 0 ? Math.round(profile.totalHits / profile.gamesPlayed) : 0}
                  </dd>
                </dl>
                {(() => {
                  const prog = getLevelProgress(Math.max(profile.totalXp || 0, profile.highScore || 0));
                  return (
                    <div className="mt-4 pt-3 border-t border-line/40">
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-paper-dim">Fortschritt zu Lv. {prog.level + 1}</span>
                        <span className="font-mono text-amber-400 font-bold">{prog.progressInLevel} / {prog.needed} XP ({prog.percent}%)</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink border border-line">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full" style={{ width: `${prog.percent}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <button type="button" onClick={() => setShowStatsModal(false)} className={primaryBtn}>
                Schließen
              </button>
            </div>
          </div>
        )}

        {showPwModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-line bg-ink p-6 text-center shadow-2xl">
              <p className="font-display text-3xl tracking-wide text-paper">🔑 Passwort ändern</p>
              <p className="mt-1 text-xs text-paper-dim">
                Spieler: <span className="font-bold text-amber-400">{profile.name}</span>
              </p>
              {pwChangeSuccess ? (
                <div className="my-5 w-full rounded-lg border border-emerald-600 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-300">
                  ✅ Passwort erfolgreich geändert!
                </div>
              ) : (
                <div className="my-4 flex flex-col gap-2.5 w-full">
                  <input
                    type="password"
                    maxLength={32}
                    value={oldPwInput}
                    onChange={(e) => { setOldPwInput(e.target.value); setPwChangeError(null); }}
                    placeholder="Altes Passwort"
                    className="h-9 w-full rounded-md border border-line bg-ink-3 px-3 text-xs text-paper outline-none placeholder:text-muted"
                  />
                  <input
                    type="password"
                    maxLength={32}
                    value={newPwInput}
                    onChange={(e) => { setNewPwInput(e.target.value); setPwChangeError(null); }}
                    placeholder="Neues Passwort (min. 4 Zeichen)"
                    className="h-9 w-full rounded-md border border-line bg-ink-3 px-3 text-xs text-paper outline-none placeholder:text-muted"
                  />
                  {pwChangeError && (
                    <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded">
                      ⚠️ {pwChangeError}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2 w-full">
                    <button
                      type="button"
                      disabled={pwChangeLoading}
                      onClick={handleChangePassword}
                      className="h-10 flex-1 rounded-md bg-amber-400 font-bold text-xs text-ink hover:bg-amber-300 disabled:opacity-50"
                    >
                      {pwChangeLoading ? "..." : "Speichern"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPwModal(false); setPwChangeError(null); }}
                      className="h-10 px-4 rounded-md border border-line bg-ink-3 text-xs font-bold text-paper hover:bg-ink"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

        {hud.mode === "results" && resultsDelay && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 p-4">
            <div className="mb-6 animate-bounce text-7xl drop-shadow-2xl">🎉✨🎊</div>
            {(() => {
              const rank = getOmaRank(hud.score);
              return (
                <div className={`w-full max-w-sm rounded-xl border p-5 text-center shadow-2xl ${rank.color}`}>
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-80">Dein erreichter Rang</p>
                  <p className="mt-1 text-2xl font-black tracking-wide">{rank.title}</p>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">{rank.desc}</p>
                </div>
              );
            })()}
          </div>
        )}

        {hud.mode === "results" && !resultsDelay && (
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
              <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
                <form className="flex flex-col gap-2" onSubmit={async (e: FormEvent) => {
                  e.preventDefault();
                  const cl = name.trim();
                  if (!cl || cl.length < 2) return setNameError("Mindestens 2 Zeichen!");
                  const b = await fetchOnlineBoard();
                  if (b.some(x => x.name.toLowerCase() === cl.toLowerCase() && cl.toLowerCase() !== (profile.name || "").toLowerCase())) {
                    return setNameError("Name bereits vergeben!");
                  }
                  setNameError(null); setNamed(true);
                  setActiveUserName(cl);
                  gameOverHandledRef.current = true;
                  const base = loadProfile(cl);
                  const nextP = {
                    ...base,
                    name: cl,
                    highScore: Math.max(base.highScore || 0, hud.score),
                    gamesPlayed: (base.gamesPlayed || 0) + 1,
                    totalHits: (base.totalHits || 0) + (hud.hits || 0),
                    totalXp: (base.totalXp || 0) + (hud.score > 0 ? hud.score : 0)
                  };
                  saveProfile(nextP);
                  setProfile(nextP);
                  setProfileInput(nextP.name);
                  setIsEditing(false);
                  const calculatedLvl = getPlayerLevel(nextP.totalXp);
                  const up = await submitScore(cl, hud.score, calculatedLvl); setBoard(up);
                }}>
                  <label className="text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">Name für die 🏆 Bestenliste</label>
                  {nameError && <p className="text-left text-xs font-bold text-red-400">⚠️ {nameError}</p>}
                  <div className="flex gap-2">
                    <input autoFocus maxLength={16} value={name} onChange={(e) => { setName(e.target.value); setNameError(null); }} placeholder="Dein Name" className="h-11 flex-1 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-muted" />
                    <button type="submit" className="h-11 rounded-md bg-paper px-4 font-semibold text-sm text-ink">Speichern</button>
                  </div>
                </form>
                <button type="button" onClick={() => { setNameError(null); setNamed(true); }} className="h-9 rounded-md border border-line/60 bg-ink/50 text-xs text-paper-dim hover:text-paper">Als Gast fortfahren (ohne Wertung)</button>
              </div>
            ) : (
              <div className="mt-4 w-full max-w-xs rounded-xl border border-line bg-ink/90 p-3 shadow-lg">
                <p className="mb-2 text-center text-xs font-bold tracking-[0.14em] text-paper uppercase">
                  🏆 Parkbank Top 10
                </p>
                <ol className="space-y-1 text-xs text-paper-dim max-h-40 overflow-y-auto">
                  {board.slice(0, 10).map((row, i) => {
                    const isGold = i === 0;
                    const isSilver = i === 1;
                    const isBronze = i === 2;
                    const isMe = Boolean(profile.name && row.name.trim().toLowerCase() === profile.name.trim().toLowerCase());
                    const rank = getOmaRank(row.score);
                    const rankEmoji = rank.title.split(" ")[0] || "🧶";

                    let itemStyle = "flex items-center justify-between py-1 px-2 rounded ";
                    if (isMe) {
                      itemStyle += "ring-2 ring-amber-400 bg-amber-500/25 border border-amber-400 text-amber-200 font-bold shadow-md ";
                    } else if (isGold) {
                      itemStyle += "bg-amber-500/20 text-amber-300 font-bold";
                    } else if (isSilver) {
                      itemStyle += "bg-slate-300/15 text-slate-200 font-semibold";
                    } else if (isBronze) {
                      itemStyle += "bg-orange-700/20 text-orange-300 font-medium";
                    } else {
                      itemStyle += "border-b border-line/30 text-paper-dim";
                    }

                    return (
                      <li key={`${row.name}-${i}-${row.score}`} className={itemStyle}>
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="w-6 font-mono font-bold text-center">
                            {isGold ? "🥇 1." : isSilver ? "🥈 2." : isBronze ? "🥉 3." : `${i + 1}.`}
                          </span>
                          <span className="text-sm select-none" title={rank.title}>{rankEmoji}</span>
                          <span className={`truncate ${isMe ? "text-amber-300 font-bold" : "text-paper"}`}>{row.name}</span>
                            <span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 select-none">Lv.{row.level || 1}</span>
                          {isMe && (
                            <span className="rounded bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-ink uppercase tracking-wider shadow">
                              DU
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-amber-400/90">{row.score} Pkt</span>
                      </li>
                    );
                  })}</ol>
              </div>
            )}

            <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
              <button
                type="button"
                className={primaryBtn}
                onClick={() => { engine?.start(); }}
              >
                Nochmal spielen
              </button>
              <button
                type="button"
                className={ghostBtn}
                onClick={() => { engine?.toTitle(); }}
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
