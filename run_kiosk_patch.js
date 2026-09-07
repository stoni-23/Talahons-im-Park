const fs = require("fs");

// 1. src/lib/shop.ts
const shopPath = "src/lib/shop.ts";
const shopContent = `export type ShopCategory = "visier" | "badge" | "wechselstube";
export interface ShopCategoryInfo { id: ShopCategory; label: string; icon: string; }

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ShopCategory;
  icon: string;
  rarity?: "standard" | "selten" | "episch" | "legendaer";
  xpReward?: number;
  crosshairColor?: string;
  badgeIcon?: string;
  available?: boolean;
}

export const POINTS_PER_COIN = 200;
export function calculateEarnedCoins(points: number): number {
  if (!points || points <= 0) return 0;
  return Math.floor(points / POINTS_PER_COIN);
}

export const SHOP_CATEGORIES: ShopCategoryInfo[] = [
  { id: "wechselstube", label: "XP-Wechselstube", icon: "🔋" },
  { id: "badge", label: "Park-Badges", icon: "🎖️" },
  { id: "visier", label: "Visier-Farben", icon: "🎯" }
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "xp_paket_klein",
    name: "Kleiner XP-Schub (+500 XP)",
    description: "Ein Schluck Kamillentee für den nächsten Levelaufstieg.",
    price: 3,
    category: "wechselstube",
    icon: "☕",
    rarity: "standard",
    xpReward: 500,
    available: false
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
    xpReward: 4000,
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
    description: "Die Park-Tauben weichen deinen Schüssen aus.",
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
    description: "Stechgrünes Visier – sticht selbst bei Nacht heraus.",
    price: 12,
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

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export function isItemPurchased(inv: string[] | undefined, id: string): boolean {
  if (id === "visier_standard") return true;
  if (!Array.isArray(inv)) return false;
  return inv.includes(id);
}

export function isItemEquipped(eq: Record<string, string> | undefined, it: ShopItem): boolean {
  if (!eq) return it.id === "visier_standard";
  if (it.category === "visier") {
    return (eq.visier || "visier_standard") === it.id;
  }
  return eq[it.category] === it.id;
}

export function getActiveBadgeIcon(eq: Record<string, string> | undefined): string | null {
  if (!eq || !eq.badge) return null;
  const it = getItemById(eq.badge);
  return it?.badgeIcon ?? null;
}

export function getActiveCrosshairColor(eq: Record<string, string> | undefined): string {
  if (!eq || !eq.visier) return "#ffffff";
  const it = getItemById(eq.visier);
  return it?.crosshairColor ?? "#ffffff";
}

export function getOwnedItemsCount(inv: string[] | undefined): number {
  return SHOP_ITEMS.filter((i) => isItemPurchased(inv, i.id)).length;
}
`;
fs.writeFileSync(shopPath, shopContent, "utf8");
console.log("[1/3] src/lib/shop.ts aktualisiert.");

// 2. src/components/kiosk-modal.tsx
const kioskPath = "src/components/kiosk-modal.tsx";
let km = fs.readFileSync(kioskPath, "utf8");

if (!km.includes("Das Visier kann nicht abgelegt werden")) {
  km = km.replace(
    /const handleToggleEquip = \(item: ShopItem\) => \{\s*if \(!profile\) return;\s*const isEq = isItemEquipped\(equipped, item\);/,
    `const handleToggleEquip = (item: ShopItem) => {\n    if (!profile) return;\n    const isEq = isItemEquipped(equipped, item);\n\n    if (item.category === "visier" && isEq) {\n      showToast("Das Visier kann nicht abgelegt werden! 🎯");\n      return;\n    }`
  );
}

const buySnippet = `                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => handleBuy(item)}
                          className={\`rounded-lg px-2.5 py-1 text-xs font-bold \${canAfford ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-neutral-800 text-neutral-500"}\`}
                        >
                          {item.price === 0 ? "Gratis" : \`\${item.price} 🪙\`}
                        </button>
                      )`;

const replaceSnippet = `                      ) : item.available === false ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-[11px] font-medium text-neutral-500"
                        >
                          🔒 Noch nicht verfügbar
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => handleBuy(item)}
                          className={\`rounded-lg px-2.5 py-1 text-xs font-bold \${canAfford ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-neutral-800 text-neutral-500"}\`}
                        >
                          {item.price === 0 ? "Gratis" : \`\${item.price} 🪙\`}
                        </button>
                      )`;

if (km.includes(buySnippet)) {
  km = km.replace(buySnippet, replaceSnippet);
  console.log("[2/3] kiosk-modal.tsx exakt ersetzt.");
} else {
  // Zeilenbasierter Ersatz als Fallback
  const lines = km.split("\n");
  const stickIdx = lines.findIndex(l => l.includes("Liegt unterm Strickzeug"));
  if (stickIdx !== -1) {
    let bStart = -1;
    for (let i = stickIdx; i < stickIdx + 6; i++) {
      if (lines[i].includes(") : (") || (lines[i].trim() === ") : (" )) {
        bStart = i;
        break;
      }
    }
    let bEnd = -1;
    for (let i = bStart + 1; i < bStart + 12; i++) {
      if (lines[i].includes(")") && lines[i+1] && lines[i+1].includes(") : (")) {
        bEnd = i;
        break;
      }
    }
    if (bStart !== -1 && bEnd !== -1) {
      lines.splice(bStart, (bEnd - bStart + 1), replaceSnippet);
      km = lines.join("\n");
      console.log("[2/3] kiosk-modal.tsx zeilenbasiert ersetzt.");
    }
  }
}
fs.writeFileSync(kioskPath, km, "utf8");

// 3. src/components/game-screen.tsx
const screenPath = "src/components/game-screen.tsx";
if (fs.existsSync(screenPath)) {
  let gs = fs.readFileSync(screenPath, "utf8");
  gs = gs.replace(/Späti \/ Kiosk/g, "Kiosk").replace(/>Späti</g, ">Kiosk<");
  fs.writeFileSync(screenPath, gs, "utf8");
  console.log("[3/3] game-screen.tsx auf Kiosk umgestellt.");
}

console.log("FERTIG!");
