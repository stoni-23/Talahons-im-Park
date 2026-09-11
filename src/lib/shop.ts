export type ShopCategory = "visier" | "badge" | "wechselstube" | "skin";
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
  minLevel?: number;
}

export const POINTS_PER_COIN = 200;
export function calculateEarnedCoins(points: number): number {
  if (!points || points <= 0) return 0;
  return Math.floor(points / POINTS_PER_COIN);
}

export const SHOP_CATEGORIES: ShopCategoryInfo[] = [
  { id: "skin", label: "Oma-Skins", icon: "👵" },
  { id: "visier", label: "Visier-Farben", icon: "🎯" },
  { id: "badge", label: "Park-Badges", icon: "🎖️" },
  { id: "wechselstube", label: "XP-Wechselstube", icon: "🔋" }
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "skin_default",
    name: "Klassische Oma",
    description: "Die unerschütterliche Parkbank-Veteranin mit ihrer treuen Standard-Pistole.",
    price: 0,
    category: "skin",
    icon: "👒",
    rarity: "standard",
    available: true
  },

  {
    id: "skin_golden_parabellum",
    name: "Golden Parabellum",
    description: "Exklusive Level-10-Belohnung! Vergoldete Eleganz auf der Parkbank mit P08 im Hochglanz-Look.",
    price: 0,
    category: "skin",
    icon: "🔫",
    rarity: "legendaer",
    minLevel: 10,
    available: true
  },
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
    price: 3,
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

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export function isItemPurchased(inv: string[] | undefined, id: string): boolean {
  if (id === "visier_standard" || id === "skin_default") return true;
  if (!Array.isArray(inv)) return false;
  return inv.includes(id);
}

export function isItemEquipped(eq: Record<string, string> | undefined, it: ShopItem): boolean {
  if (!eq) return it.id === "visier_standard" || it.id === "skin_default";
  if (it.category === "visier") {
    return (eq.visier || "visier_standard") === it.id;
  }
  if (it.category === "skin") {
    return (eq.skin || "skin_default") === it.id;
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

export function getActiveSkin(eq: Record<string, string> | undefined): string {
  return eq?.skin || "default";
}

export function getOwnedItemsCount(inv: string[] | undefined): number {
  return SHOP_ITEMS.filter((i) => isItemPurchased(inv, i.id)).length;
}
