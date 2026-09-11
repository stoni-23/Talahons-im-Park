import React, { useEffect, useRef, useState } from "react";
import type { PlayerProfile } from "@/lib/profile";
import {  playShot , isMuted } from "@/game/audio";
import { getActiveCrosshairColor } from "@/lib/shop";
import { Pause, Play } from "lucide-react";

interface TonnenGameProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (updated: PlayerProfile) => void;
}

interface TonneSlot {
  id: number;
  x: number;
  y: number;
  scale: number;
  z: number;
  state: "zu" | "rumble" | "hippie" | "hit";
  openT: number;
  openDur: number;
  wobble: number;
}

interface ImpactFX {
  x: number;
  y: number;
  t: number;
}

interface Floater {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

const WORLD_W = 900;
const WORLD_H = 1600;
const FIRE_CD = 0.18;

const WHEEL_SECTORS = [
  { label: "1 COIN", icon: "🪙", color: "#f59e0b", textColor: "#000", coins: 1, xp: 0, extra: false, weight: 15 },
  { label: "NIETE", icon: "🍂", color: "#262626", textColor: "#9ca3af", coins: 0, xp: 0, extra: false, weight: 30 },
  { label: "+1 DREH", icon: "🔄", color: "#3b82f6", textColor: "#fff", coins: 0, xp: 0, extra: true, weight: 15 },
  { label: "NIETE", icon: "🍂", color: "#1c1917", textColor: "#9ca3af", coins: 0, xp: 0, extra: false, weight: 20 },
  { label: "25 XP", icon: "⚡", color: "#10b981", textColor: "#000", coins: 0, xp: 25, extra: false, weight: 15 },
  { label: "JACKPOT", icon: "👑", color: "#ef4444", textColor: "#fff", coins: 2, xp: 75, extra: false, weight: 5 },
  { label: "NIETE", icon: "🍂", color: "#262626", textColor: "#9ca3af", coins: 0, xp: 0, extra: false, weight: 25 },
  { label: "10 XP", icon: "⚡", color: "#059669", textColor: "#fff", coins: 0, xp: 10, extra: false, weight: 20 },
];

let tonnenBgm: HTMLAudioElement | null = null;

export const TonnenGame: React.FC<TonnenGameProps> = ({
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  

  
  

  const [gameState, setGameState] = useState<"playing" | "paused" | "results_delay" | "results" | "spielo">("playing");
  const [scoreHits, setScoreHits] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Glücksrad State
  const [herbsLeft, setHerbsLeft] = useState(0);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResultText, setWheelResultText] = useState("Dreh das Rad!");
  const [totalWonCoins, setTotalWonCoins] = useState(0);
  const [totalWonXp, setTotalWonXp] = useState(0);
  // Audio-Lebenszyklus als echtes Singleton
  useEffect(() => {
    if (!tonnenBgm) {
      tonnenBgm = new Audio("/audio/tonnen_groove.mp3");
      tonnenBgm.loop = true;
      tonnenBgm.volume = 0.45; // Angenehm leise
    }

    const playSafe = () => {
      if (tonnenBgm && !isMuted() && tonnenBgm.paused) {
        tonnenBgm.play().catch(() => {});
      }
    };

    if (!isMuted()) {
      playSafe();
    }

    const unlockOnFirstClick = () => {
      playSafe();
      window.removeEventListener("pointerdown", unlockOnFirstClick);
    };
    window.addEventListener("pointerdown", unlockOnFirstClick);

    return () => {
      window.removeEventListener("pointerdown", unlockOnFirstClick);
      if (tonnenBgm) {
        tonnenBgm.pause();
        tonnenBgm.currentTime = 0;
        tonnenBgm = null;
      }
    };
  }, []);

  // Exakte Zustandssteuerung
  useEffect(() => {
    if (!tonnenBgm) return;

    if (gameState === "playing") {
      if (!isMuted() && tonnenBgm.paused) {
        tonnenBgm.play().catch(() => {});
      }
    } else if (gameState === "paused") {
      tonnenBgm.pause();
    } else {
      // results_delay, results, spielo: Sofort aus und zuruecksetzen
      tonnenBgm.pause();
      tonnenBgm.currentTime = 0;
    }
  }, [gameState]);
  
  

  

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setGameState((prev) => {
          if (prev === "playing") return "paused";
          if (prev === "paused") return "playing";
          return prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hitsRef = useRef(0);
  const missCountRef = useRef(0);
  const fireCdRef = useRef(0.4);
  const recoilRef = useRef(0);
  const hitTraumaRef = useRef(0);
  const muzzleFlashRef = useRef(0);
  const impactsRef = useRef<ImpactFX[]>([]);
  const floatersRef = useRef<Floater[]>([]);
  const crosshairRef = useRef<{ x: number; y: number; kick: number }>({ x: WORLD_W / 2, y: 1050, kick: 0 });

  // Phasensteuerung: "idle" -> "warning_rumble" -> "peek"
  const turnPhaseRef = useRef<"idle" | "rumble">("idle");
  const phaseTimerRef = useRef(1.2);
  const targetSlotIdRef = useRef<number | null>(null);

  const slotsRef = useRef<TonneSlot[]>([
    { id: 1, x: 210, y: 990, scale: 0.58, z: 1, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 2, x: 450, y: 980, scale: 0.58, z: 1, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 3, x: 690, y: 990, scale: 0.58, z: 1, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 4, x: 190, y: 1040, scale: 0.70, z: 2, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 5, x: 520, y: 1100, scale: 0.76, z: 2, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 6, x: 740, y: 1090, scale: 0.76, z: 2, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 7, x: 380, y: 1110, scale: 0.82, z: 3, state: "zu", openT: 0, openDur: 0, wobble: 0 },
    { id: 8, x: 620, y: 1180, scale: 0.95, z: 3, state: "zu", openT: 0, openDur: 0, wobble: 0 },
  ]);

  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const assets = [
      { key: "bg", src: "/assets/park-bg.jpg" },
      { key: "tree", src: "/assets/tree.png" },
      { key: "foliage", src: "/assets/foliage.png" },
      { key: "oma", src: "/assets/oma.png" },
      { key: "oma-recoil", src: "/assets/oma-recoil.png" },
      { key: "oma-goldenpara", src: "/assets/oma-goldenpara.png" },
      { key: "oma-goldenpara-recoil", src: "/assets/oma-goldenpara-recoil.png" },
      { key: "tonne-zu", src: "/assets/tonne-zu.png" },
      { key: "tonne-hippie", src: "/assets/tonne-hippie.png" },
      { key: "muzzle-1", src: "/assets/muzzle-1.png" },
      { key: "muzzle-2", src: "/assets/muzzle-2.png" },
      { key: "muzzle-3", src: "/assets/muzzle-3.png" },
      { key: "muzzle-4", src: "/assets/muzzle-4.png" },
      { key: "impact-1", src: "/assets/impact-1.png" },
      { key: "impact-2", src: "/assets/impact-2.png" },
      { key: "impact-3", src: "/assets/impact-3.png" },
      { key: "impact-4", src: "/assets/impact-4.png" },
    ];
    assets.forEach((a) => {
      const img = new Image();
      img.src = a.src;
      img.onload = () => {
        imagesRef.current[a.key] = img;
      };
    });
  }, []);

  const getHippieStayTime = (hits: number) => {
    if (hits >= 15) return 0.30;
    if (hits >= 10) return 0.36;
    if (hits >= 5) return 0.44;
    return 0.55;
  };

  const triggerGameOver = () => {
    setHerbsLeft(hitsRef.current);
    setGameState("results_delay");
    setTimeout(() => {
      setGameState("results");
    }, 1800);
  };
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId: number;
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      renderCanvas();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (fireCdRef.current > 0) fireCdRef.current = Math.max(0, fireCdRef.current - dt);
      if (recoilRef.current > 0) recoilRef.current = Math.max(0, recoilRef.current - dt);
      if (hitTraumaRef.current > 0) hitTraumaRef.current = Math.max(0, hitTraumaRef.current - dt * 4);
      if (muzzleFlashRef.current > 0) muzzleFlashRef.current = Math.max(0, muzzleFlashRef.current - dt);
      if (crosshairRef.current.kick > 0) crosshairRef.current.kick = Math.max(0, crosshairRef.current.kick - dt * 6);

      impactsRef.current.forEach((imp) => (imp.t -= dt));
      impactsRef.current = impactsRef.current.filter((imp) => imp.t > 0);

      floatersRef.current.forEach((fl) => {
        fl.y -= dt * 60;
        fl.life -= dt;
      });
      floatersRef.current = floatersRef.current.filter((fl) => fl.life > 0);

      // Phasenlogik: Erst Pause, dann Rumble-Täuschung, dann ploppt der echte Hippie auf
      const activeHippie = slotsRef.current.some((s) => s.state === "hippie");

      if (!activeHippie) {
        phaseTimerRef.current -= dt;

        if (turnPhaseRef.current === "idle" && phaseTimerRef.current <= 0) {
          // Täuschung starten: 2-3 Tonnen wackeln lassen
          const allSlots = [...slotsRef.current];
          const shuffled = allSlots.sort(() => Math.random() - 0.5);
          const rumbleCount = Math.min(3, 2 + (Math.random() > 0.5 ? 1 : 0));
          const rumbled = shuffled.slice(0, rumbleCount);

          // Eine von den gewackelten wird der echte Hippie
          targetSlotIdRef.current = rumbled[0].id;

          rumbled.forEach((s) => {
            const slot = slotsRef.current.find((item) => item.id === s.id);
            if (slot) {
              slot.state = "rumble";
              slot.wobble = 0.5;
            }
          });

          turnPhaseRef.current = "rumble";
          phaseTimerRef.current = 0.45; // 0.45s Wackel-Vorwarnung
        } else if (turnPhaseRef.current === "rumble" && phaseTimerRef.current <= 0) {
          // Nach dem Wackeln: Nur die ECHTE Ziel-Tonne öffnet sich
          slotsRef.current.forEach((s) => {
            if (s.id === targetSlotIdRef.current) {
              s.state = "hippie";
              s.openT = 0;
              s.openDur = getHippieStayTime(hitsRef.current);
            } else if (s.state === "rumble") {
              s.state = "zu";
              s.wobble = 0;
            }
          });

          turnPhaseRef.current = "idle";
          phaseTimerRef.current = Math.max(0.9, 1.6 - hitsRef.current * 0.03);
        }
      }

      slotsRef.current.forEach((slot) => {
        if (slot.wobble > 0) slot.wobble = Math.max(0, slot.wobble - dt * 5);

        if (slot.state === "hippie") {
          slot.openT += dt;
          if (slot.openT >= slot.openDur) {
            slot.state = "zu";
            missCountRef.current += 1;
            if (missCountRef.current >= 3) {
              triggerGameOver();
            }
          }
        } else if (slot.state === "hit") {
          slot.openT += dt;
          if (slot.openT >= 0.30) {
            slot.state = "zu";
          }
        }
      });
      if (gameState === "playing") {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const renderCanvas = () => {
    const userCrosshairColor = ((profile as any)?.equipped?.crosshairColor || (profile as any)?.crosshairColor || "#ffffff");
    const canvas = canvasRef.current;
    
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();

    // SCREENSHAKE NUR BEIM ECHTEN TREFFER!
    if (hitTraumaRef.current > 0) {
      const shake = hitTraumaRef.current * hitTraumaRef.current * 18;
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    // 1. Hintergrund
    const bg = imagesRef.current["bg"];
    if (bg) {
      const targetRatio = WORLD_W / WORLD_H;
      if (!bg.naturalHeight || !bg.naturalWidth) return;
      const srcW = bg.naturalHeight * targetRatio;
      const srcX = (bg.width - srcW) / 2;
      ctx.drawImage(bg, srcX, 0, srcW, bg.height, 0, 0, WORLD_W, WORLD_H);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }

    // 2. Großer Baum
    const tree = imagesRef.current["tree"];
    if (tree) {
      const targetRatio = WORLD_W / WORLD_H;
      const srcW = tree.height * targetRatio;
      const srcX = (tree.width - srcW) / 2;
      ctx.drawImage(tree, srcX, 0, srcW, tree.height, 0, 0, WORLD_W, WORLD_H);
    }

    // 3. Dunkelheit / Nacht-Overlay
    ctx.save();
    ctx.fillStyle = "rgba(10, 16, 35, 0.45)";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();

    // 4. Tonnen
    const sorted = [...slotsRef.current].sort((a, b) => a.z - b.z);
    sorted.forEach((slot) => {
      let sprite = imagesRef.current["tonne-zu"];
      if (slot.state === "hippie") {
        sprite = imagesRef.current["tonne-hippie"] || sprite;
      }

      if (sprite) {
        ctx.save();
        const h = 260 * slot.scale;
        if (!sprite.naturalWidth || !sprite.naturalHeight) return;
        const ratio = sprite.naturalWidth / sprite.naturalHeight;
        const w = h * ratio;

        // Wackeln bei Täuschung (rumble) oder bei Treffer (hit)
        const isRumbling = slot.state === "rumble";
        if (slot.wobble > 0 || isRumbling) {
          const intensity = isRumbling ? 0.08 : 0.16;
          const speed = isRumbling ? 36 : 28;
          const angle = Math.sin((performance.now() / 1000) * speed) * intensity;
          ctx.translate(slot.x, slot.y);
          ctx.rotate(angle);
          ctx.drawImage(sprite, -w / 2, -h, w, h);
        } else {
          ctx.drawImage(sprite, slot.x - w / 2, slot.y - h, w, h);
        }
        ctx.restore();
      }
    });

    // 6. Foliage Vordergrund
    const foliage = imagesRef.current["foliage"];
    if (foliage) {
      ctx.drawImage(foliage, 0, WORLD_H - 260, WORLD_W, 260);
    }

    // 5. Oma
    const isGoldSkin = profile?.equipped?.skin === "skin_golden_parabellum" || (profile as any)?.equippedSkin === "skin_golden_parabellum";
    const isRecoiling = recoilRef.current > 0.02;
    const omaKey = isGoldSkin
      ? (isRecoiling ? "oma-goldenpara-recoil" : "oma-goldenpara")
      : (isRecoiling ? "oma-recoil" : "oma");
    const omaImg = imagesRef.current[omaKey] || imagesRef.current["oma"];

    const omaH = 560;
    const omaW = (omaImg && omaImg.naturalHeight) ? omaH * (omaImg.naturalWidth / omaImg.naturalHeight) : 530;
    const omaX = -10;
    const omaY = WORLD_H - omaH + 25 + (isRecoiling ? -6 : 0);

    if (omaImg) {
      ctx.drawImage(omaImg, omaX, omaY, omaW, omaH);
    }

    

    // 7. Mündungsfeuer
    if (muzzleFlashRef.current > 0) {
      const frameIdx = Math.min(4, Math.max(1, 5 - Math.ceil(muzzleFlashRef.current / 0.15 * 4)));
      const muzzleImg = imagesRef.current[`muzzle-${frameIdx}`] || imagesRef.current["muzzle-1"];
      if (muzzleImg) {
        const mx = omaX + omaW * 0.85;
        const my = omaY + omaH * 0.15;
        const size = 130;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.min(1, muzzleFlashRef.current * 6);
        ctx.drawImage(muzzleImg, mx - size / 2, my - size / 2, size, size);
        ctx.restore();
      }
    }

    // 8. Treffer-Impacts
    impactsRef.current.forEach((imp) => {
      const frameIndex = Math.min(4, Math.max(1, 4 - Math.ceil(imp.t * 16)));
      const impactImg = imagesRef.current[`impact-${frameIndex}`];
      if (impactImg) {
        const sz = 130;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.min(1, imp.t * 5);
        ctx.drawImage(impactImg, imp.x - sz / 2, imp.y - sz / 2, sz, sz);
        ctx.restore();
      }
    });

    // 9. Floater Text (+1g 🌿)
    floatersRef.current.forEach((fl) => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, fl.life * 2);
      ctx.font = "900 36px sans-serif";
      ctx.fillStyle = fl.color;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;
      ctx.textAlign = "center";
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillText(fl.text, fl.x, fl.y);
      ctx.restore();
    });

            // 10. ORIGINAL FADENKREUZ AUS ENGINE.TS
    const { x, y, kick: chKick } = crosshairRef.current;
    const kick = chKick > 0.14 ? 4 : 0;
    const cColor = getActiveCrosshairColor(profile?.equipped);

    ctx.save();
    ctx.strokeStyle = cColor;
    ctx.fillStyle = cColor;
    ctx.lineWidth = 7;

    // Kreis
    ctx.beginPath();
    ctx.arc(x, y, 16 + kick, 0, Math.PI * 2);
    ctx.stroke();

    // Mittelpunkt
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Striche
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

        // Dunkler Schattenring im Hintergrund
    ctx.strokeStyle = "rgba(10,10,10,0.55)";
    ctx.lineWidth = 7;
    ctx.globalCompositeOperation = "destination-over";
    ctx.beginPath();
    ctx.arc(x, y, 16 + kick, 0, Math.PI * 2);
    ctx.stroke();
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
    ctx.restore();

    // 11. HUD oben
    ctx.save();
    ctx.fillStyle = "rgba(10, 15, 29, 0.85)";
    ctx.roundRect(WORLD_W / 2 - 180, 40, 360, 68, 18);
    ctx.fill();
    ctx.strokeStyle = userCrosshairColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "900 28px sans-serif";
    ctx.fillStyle = "#34d399";
    ctx.textAlign = "center";
    ctx.fillText(`🌿 ${hitsRef.current}g Kräuter`, WORLD_W / 2, 85);

    const hearts = "❤️".repeat(Math.max(0, 3 - missCountRef.current)) + "🖤".repeat(missCountRef.current);
    ctx.font = "26px sans-serif";
    ctx.fillText(hearts, WORLD_W / 2, 145);
    ctx.restore();
  };

  const updateCrosshairPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    crosshairRef.current.x = ((clientX - r.left) / r.width) * WORLD_W;
    crosshairRef.current.y = ((clientY - r.top) / r.height) * WORLD_H;
  };

  const handleShoot = (clientX: number, clientY: number) => {
    if (gameState !== "playing") return;
    if (fireCdRef.current > 0) return;

    updateCrosshairPos(clientX, clientY);
    fireCdRef.current = FIRE_CD;
    crosshairRef.current.kick = 1.0;

    try {
      playShot();
    } catch {}

    recoilRef.current = 0.12;
    muzzleFlashRef.current = 0.15;

    const clickX = crosshairRef.current.x;
    const clickY = crosshairRef.current.y;

    const hitCandidates = [...slotsRef.current]
      .filter((s) => s.state === "hippie")
      .sort((a, b) => b.z - a.z);

    let hitHippie = false;
    for (const slot of hitCandidates) {
      const h = 260 * slot.scale;
      const w = h * 0.9;
      const top = slot.y - h;

      // PRÄZISE HITBOX: NUR DER KOPF / OBERKÖRPER DES HIPPIES ZÄHLT!
      const headTop = top;
      const headBottom = top + h * 0.38;
      const headLeft = slot.x - w * 0.28;
      const headRight = slot.x + w * 0.28;

      if (clickX >= headLeft && clickX <= headRight && clickY >= headTop && clickY <= headBottom) {
        slot.state = "hit";
        slot.wobble = 1.2;
        slot.openT = 0;
        hitsRef.current += 1;
        setScoreHits(hitsRef.current);
        hitTraumaRef.current = 0.45;
        impactsRef.current.push({ x: clickX, y: clickY, t: 0.25 });
        floatersRef.current.push({
          text: "+1g 🌿",
          x: slot.x,
          y: headTop - 15,
          life: 0.8,
          color: "#4ade80",
        });
        hitHippie = true;
        break;
      }
    }

    // FEHLSCHUSS: Klick auf Tonne oder Umgebung animieren
    if (!hitHippie) {
      let hitCan = false;
      const allSlots = [...slotsRef.current].sort((a, b) => b.z - a.z);
      for (const slot of allSlots) {
        const h = 260 * slot.scale;
        const w = h * 0.9;
        const canTop = slot.y - h * 0.75;
        const canBottom = slot.y + 10;
        const canLeft = slot.x - w * 0.45;
        const canRight = slot.x + w * 0.45;

        if (clickX >= canLeft && clickX <= canRight && clickY >= canTop && clickY <= canBottom) {
          slot.wobble = Math.max(slot.wobble, 0.5);
          impactsRef.current.push({ x: clickX, y: clickY, t: 0.2 });
          floatersRef.current.push({
            text: "*Klonk!*",
            x: clickX,
            y: clickY - 10,
            life: 0.5,
            color: "#9ca3af",
          });
          hitCan = true;
          break;
        }
      }

      if (!hitCan) {
        impactsRef.current.push({ x: clickX, y: clickY, t: 0.15 });
      }
    }
  };
  // GLÜCKSRAD DREHEN
    const spinWheel = () => {
    if (herbsLeft <= 0 || isSpinning) return;

    setIsSpinning(true);
    setHerbsLeft((h) => h - 1);

    // Gewichtete Auslosung
    const totalWeight = WHEEL_SECTORS.reduce((acc, s) => acc + (s.weight || 10), 0);
    let rnd = Math.random() * totalWeight;
    let targetIdx = 0;
    for (let i = 0; i < WHEEL_SECTORS.length; i++) {
      rnd -= (WHEEL_SECTORS[i].weight || 10);
      if (rnd <= 0) {
        targetIdx = i;
        break;
      }
    }

    const sectorAngle = 360 / WHEEL_SECTORS.length; // 45 Grad
    const centerOffset = sectorAngle / 2; // 22.5 Grad
    // Ausrichtung des Zentrums von targetIdx genau nach oben auf 0 Grad (unter den Pfeil)
    const desiredStop = (360 - (targetIdx * sectorAngle + centerOffset)) % 360;
    const currentRot = wheelAngle % 360;
    const diff = (desiredStop - currentRot + 360) % 360;
    // Mindestens 5 volle Drehungen + exakter Differenzwinkel
    const newAngle = wheelAngle + 5 * 360 + diff;
    setWheelAngle(newAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const won = WHEEL_SECTORS[targetIdx];

      if (won.extra) {
        setHerbsLeft((h) => h + 1);
        setWheelResultText("🔄 Extra-Dreh geschenkt!");
      } else {
        setTotalWonCoins((c) => c + won.coins);
        setTotalWonXp((x) => x + won.xp);

        if (won.coins > 0 && won.xp > 0) {
          setWheelResultText(`🎉 JACKPOT! +${won.coins} Coins & +${won.xp} XP!`);
        } else if (won.coins > 0) {
          setWheelResultText(`🪙 +${won.coins} Coin gewonnen!`);
        } else if (won.xp > 0) {
          setWheelResultText(`⚡ +${won.xp} XP gesammelt!`);
        } else {
          setWheelResultText("🍂 Niete! Versuchs nochmal.");
        }

        if (won.coins > 0 || won.xp > 0) {
          const updated: Profile = {
            ...profile,
            coins: (profile.coins || 0) + won.coins,
            totalXp: (profile.totalXp || 0) + won.xp,
          };
          onUpdateProfile(updated);
        }
      }
    }, 3200);
  };

  const getTonnenRank = (hits: number) => {
    if (hits >= 12) return { title: "👑 Tonnen-König", desc: "Absolute Perfektion! Du hast den Park voll im Griff.", color: "text-amber-400 border-amber-500/50 bg-amber-950/40" };
    if (hits >= 8) return { title: "⚡ Parkmauer-Jäger", desc: "Verdammt flinke Finger! Kaum ein Hippie entkam dir.", color: "text-purple-400 border-purple-500/50 bg-purple-950/40" };
    if (hits >= 4) return { title: "🌿 Gelegenheits-Sammler", desc: "Solide Ausbeute für die Park-Spielo!", color: "text-emerald-400 border-emerald-500/50 bg-emerald-950/40" };
    return { title: "👀 Park-Neuling", desc: "Der Hippie war flinker. Dreh am Rad oder versuch's gleich nochmal!", color: "text-neutral-400 border-neutral-700 bg-neutral-900/50" };
  };

  const rank = getTonnenRank(scoreHits);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden touch-none">
      {/* 1. VOLLBILD CANVAS */}
      <canvas
        ref={canvasRef}
        width={WORLD_W}
        height={WORLD_H}
        onMouseMove={(e) => updateCrosshairPos(e.clientX, e.clientY)}
        onMouseDown={(e) => handleShoot(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          const t = e.touches[0];
          updateCrosshairPos(t.clientX, t.clientY);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          handleShoot(t.clientX, t.clientY);
        }}
        className={`w-full h-full max-w-[520px] object-cover sm:object-contain cursor-crosshair ${gameState !== "playing" ? "hidden" : "block"}`}
      />

      
      

      
      {/* PAUSE BUTTON UNTEN RECHTS (Original IconBtn Style) */}
      {(gameState === "playing" || gameState === "paused") && (
        <div className="absolute right-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 sm:right-5">
          <button
            type="button"
            aria-label={gameState === "paused" ? "Weiter" : "Pause"}
            onClick={() => setGameState(prev => prev === "paused" ? "playing" : "paused")}
            className="flex size-11 items-center justify-center rounded-md border border-line bg-ink-2 text-paper shadow-md transition-all hover:bg-ink hover:text-paper-light active:scale-95"
          >
            {gameState === "paused" ? <Play className="size-5" /> : <Pause className="size-5" />}
          </button>
        </div>
      )}

            {/* PAUSEN MODAL (1:1 ORIGINAL AUS GAME-SCREEN.TSX) */}
      {gameState === "paused" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl border border-neutral-700 bg-neutral-900/95 p-6 text-center shadow-2xl space-y-4">
            <h2 className="font-display text-4xl font-black tracking-wider text-white">PAUSE</h2>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGameState("playing")}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 py-3 font-bold uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all hover:brightness-110"
              >
                Weiter
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 font-bold uppercase tracking-wider text-neutral-300 shadow-md active:scale-95 transition-all hover:bg-neutral-700 hover:text-white"
              >
                Menü
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. KLICKSCHUTZ: 1.8 Sekunden Einblendung */}
      {gameState === "results_delay" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
          <div className="mb-6 animate-bounce text-7xl drop-shadow-2xl">🗑️✨🌿</div>
          <div className={`w-full max-w-sm rounded-xl border p-5 text-center shadow-2xl ${rank.color}`}>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-80">Dein erreichter Rang</p>
            <p className="mt-1 text-2xl font-black tracking-wide">{rank.title}</p>
            <p className="mt-2 text-sm leading-relaxed opacity-90">{rank.desc}</p>
          </div>
        </div>
      )}

      {/* 3. PUNKTE-TAFEL: Wie im Hauptspiel */}
      {gameState === "results" && (
        <div className="p-6 text-center space-y-4 bg-neutral-900/95 rounded-2xl border border-neutral-800 shadow-2xl mx-4 max-w-sm w-full">
          <p className="text-3xl font-black tracking-wide text-white uppercase">Runde vorbei</p>
          <div className="mt-2 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tabular-nums tracking-wide text-emerald-400">
              🌿 {scoreHits}g
            </span>
            <span className="mt-1 text-xs text-neutral-400 font-medium">
              Kräuter für das Glücksrad gesichert
            </span>
          </div>

          <div className={`w-full rounded-xl border p-3 text-center ${rank.color}`}>
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-80">Rang</p>
            <p className="mt-0.5 text-base font-black tracking-wide">{rank.title}</p>
          </div>

          <button
            type="button"
            onClick={() => setGameState("spielo")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 font-black text-neutral-950 uppercase tracking-wider shadow-lg shadow-amber-950/60 active:scale-95 transition-all cursor-pointer"
          >
            Ab zum Park-Glücksrad 🎡
          </button>
        </div>
      )}

      {/* 4. PARK-GLÜCKSRAD */}
      {gameState === "spielo" && (
        <div className="w-full h-full max-w-[480px] p-5 flex flex-col justify-between items-center text-center bg-neutral-950 select-none">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-black">
              Park-Spielo Glücksrad
            </span>
            <h3 className="text-xl font-black text-white">Dreh das Kräuterrad!</h3>
            <p className="text-xs text-neutral-400">
              Einsatz: 1g Kräuter pro Dreh.
            </p>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="absolute -top-4 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />

            <div
              className="w-72 h-72 rounded-full border-4 border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.25)] relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.15, 0.85, 0.35, 1)"
              style={{
                transform: `rotate(${wheelAngle}deg)`,
                background: "conic-gradient(#f59e0b 0% 12.5%, #262626 12.5% 25%, #3b82f6 25% 37.5%, #1c1917 37.5% 50%, #10b981 50% 62.5%, #ef4444 62.5% 75%, #262626 75% 87.5%, #059669 87.5% 100%)",
              }}
            >
              {WHEEL_SECTORS.map((sec, i) => {
                const angle = i * 45 + 22.5;
                return (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 -ml-6 w-12 h-36 origin-bottom flex flex-col items-center pt-2 text-[11px] font-black tracking-tight"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      color: sec.textColor,
                    }}
                  >
                    <span className="text-base leading-none drop-shadow">{sec.icon}</span>
                    <span className="text-[10px] leading-tight mt-0.5 drop-shadow">{sec.label}</span>
                  </div>
                );
              })}

              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center text-xl z-20 shadow-inner">
                🎡
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-bold text-emerald-400">
              Verbleibend: {herbsLeft}g Kräuter
            </div>
            <div className="flex gap-4 justify-center text-xs font-semibold text-neutral-300">
              <span>Gewonnen: 🪙 {totalWonCoins} Coins</span>
              <span>⚡ {totalWonXp} XP</span>
            </div>
            <div className="h-8 flex items-center justify-center">
              <span className="text-sm text-amber-400 font-bold animate-pulse">
                {wheelResultText}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <button
              type="button"
              disabled={herbsLeft <= 0 || isSpinning}
              onClick={spinWheel}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 font-black text-neutral-950 uppercase tracking-wider shadow-lg shadow-amber-950/60 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isSpinning ? "Rad dreht sich…" : herbsLeft > 0 ? "Rad drehen (1g)" : "Keine Kräuter mehr"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (herbsLeft > 0) setShowExitConfirm(true);
                else onClose();
              }}
              className="w-full py-2.5 rounded-lg bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700"
            >
              Hauptmenü
            </button>
          </div>
        </div>
      )}

      {/* ABBRUCH-WARNUNG */}
      {showExitConfirm && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-red-500/50 p-5 rounded-2xl max-w-xs text-center space-y-3 shadow-2xl">
            <span className="text-3xl">⚠️</span>
            <h4 className="text-sm font-black text-white uppercase">Achtung!</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Du hast noch <span className="text-emerald-400 font-bold">{herbsLeft}g Kräuter</span> übrig!
              Wenn du jetzt gehst, werden sie von der Parkstreife beschlagnahmt.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-emerald-600 font-bold text-white text-xs"
              >
                Weiterspielen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2 rounded-lg bg-neutral-800 font-bold text-red-400 text-xs border border-neutral-700"
              >
                Verlassen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
