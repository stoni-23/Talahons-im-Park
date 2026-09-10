function getIconBorderColor(r) {
  if (r === "legendaer") return "#f59e0b"; // Orange wie Parabellum
  if (r === "episch") return "#a855f7";    // Lila
  if (r === "selten") return "#0ea5e9";    // Blau
  return "#525252";                        // Neutral / Standard
}
function getRarityGlow(r) {
  if (r === "legendaer") return { border: "2px solid #f59e0b", shadow: "0 0 10px rgba(245, 158, 11, 0.75)" };
  if (r === "episch") return { border: "2px solid #a855f7", shadow: "0 0 8px rgba(168, 85, 247, 0.6)" };
  if (r === "selten") return { border: "2px solid #0ea5e9", shadow: "0 0 8px rgba(14, 165, 233, 0.6)" };
  return { border: "2px solid #444444", shadow: "none" };
}
function getIconRarity(r) {
  if (r === "legendaer") return { border: "#f59e0b", shadow: "0 0 10px rgba(245, 158, 11, 0.7)" };
  if (r === "episch") return { border: "#a855f7", shadow: "0 0 8px rgba(168, 85, 247, 0.6)" };
  if (r === "selten") return { border: "#0ea5e9", shadow: "0 0 8px rgba(14, 165, 233, 0.6)" };
  return { border: "#404040", shadow: "none" };
}
import { SkinPreviewModal } from "./skin-preview-modal";
import { getPlayerLevel } from "@/lib/profile";
import React, { useState, useMemo, useEffect } from "react";
import { SHOP_ITEMS, SHOP_CATEGORIES, type ShopCategory, type ShopItem, isItemPurchased, isItemEquipped } from "../lib/shop";
import type { PlayerProfile } from "../lib/profile";

export type KioskTab = "shop" | "inventory";

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile | null;
  onUpdateProfile?: (updatedProfile: PlayerProfile) => void;
  initialTab?: KioskTab;
}

export const KioskModal: React.FC<KioskModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  initialTab = "shop",
}) => {
  const [activeTab, setActiveTab] = useState<KioskTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | "alle">("alle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasNewItemInModal, setHasNewItemInModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ name: string; type: "skin" | "visier"; idle?: string; shoot?: string; color?: string } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const currentCoins = profile?.coins ?? 0;
  const inventory = profile?.inventory ?? [];
  const equipped = profile?.equipped ?? {};

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  
  // Alte XP-Reste aus Ausrüstung / Inventar sofort restlos entfernen
  useEffect(() => {
    if (!profile) return;
    let changed = false;
    const cleanEquipped = { ...(profile.equipped || {}) };
    
    // Entferne alte XP-Kategorie aus Ausrüstung
    if (cleanEquipped["wechselstube"] || cleanEquipped["xp"]) {
      delete cleanEquipped["wechselstube"];
      delete cleanEquipped["xp"];
      changed = true;
    }

    // Entferne XP-Paket-IDs aus Inventar & Ausrüstung
    const xpIds = ["xp_paket_klein", "xp_paket_mittel", "xp_paket_gross"];
    for (const [cat, id] of Object.entries(cleanEquipped)) {
      if (xpIds.includes(id)) {
        delete cleanEquipped[cat];
        changed = true;
      }
    }

    const cleanInventory = (profile.inventory || []).filter(id => !xpIds.includes(id));
    if (cleanInventory.length !== (profile.inventory || []).length) {
      changed = true;
    }

    if (changed) {
      const updated = {
        ...profile,
        inventory: cleanInventory,
        equipped: cleanEquipped
      };
      persist(updated);
    }
  }, [profile?.name]);

  const ownedItems = useMemo(() => {
    return SHOP_ITEMS.filter((item) => !item.xpReward && item.category !== "wechselstube" && isItemPurchased(inventory, item.id));
  }, [inventory]);

  const visibleItems = useMemo(() => {
    const list = activeTab === "shop" ? SHOP_ITEMS : ownedItems;
    if (selectedCategory === "alle") return list;
    return list.filter((item) => item.category === selectedCategory);
  }, [activeTab, selectedCategory, ownedItems]);

  if (!isOpen) return null;

  function persist(updated: PlayerProfile) {
    try {
      localStorage.setItem("park_profile", JSON.stringify(updated));
      localStorage.setItem("player_profile", JSON.stringify(updated));
    } catch (e) {}
    onUpdateProfile?.(updated);
  };

  const handleBuy = (item: ShopItem) => {
    if (!profile) return;
    if (currentCoins < item.price) {
      showToast("Zu wenig Oma-Groschen!");
      return;
    }

    // A) XP-PAKET: Sofort gutschreiben, nicht ins Inventar/Equipped packen
    if (item.category === "wechselstube" || item.xpReward) {
      const xpToAdd = Number(item.xpReward) || 0;
      const updatedCoins = currentCoins - item.price;
      
      const cleanedInventory = inventory.filter((id) => id !== item.id);
      const cleanedEquipped = { ...equipped };
      delete cleanedEquipped[item.category];

      const updated: PlayerProfile = {
        ...profile,
        coins: updatedCoins,
        totalXp: (Number(profile.totalXp) || 0) + xpToAdd,
        inventory: cleanedInventory,
        equipped: cleanedEquipped,
      };

      persist(updated);
      showToast(`+${xpToAdd} XP erhalten! 🔋`);
      return;
    }

    // B) NORMALES ITEM
    if (isItemPurchased(inventory, item.id)) {
      showToast("Bereits im Besitz!");
      return;
    }

    const updatedCoins = currentCoins - item.price;
    const updatedInventory = Array.from(new Set([...inventory, item.id]));

    setHasNewItemInModal(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kiosk:new_item"));
    }

    const updated: PlayerProfile = {
      ...profile,
      coins: updatedCoins,
      inventory: updatedInventory,
      equipped: equipped,
    };

    persist(updated);
    showToast(`"${item.name}" liegt jetzt in der Handtasche! 👜`);
  };

  const handleToggleEquip = (item: ShopItem) => {
    if (!profile) return;
    const isEq = isItemEquipped(equipped, item);

    if ((item.category === "visier" || item.category === "skin") && isEq) {
      showToast(item.category === "skin" ? "Skin kann nicht abgelegt werden! Wähle einen anderen. 👵" : "Das Visier kann nicht abgelegt werden! 🎯");
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
    const updated: PlayerProfile = {
      ...profile,
      equipped: updatedEquipped,
    };
    persist(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex h-[92vh] sm:h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="border-b border-neutral-800 bg-neutral-950/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-base font-bold text-neutral-100">Kiosk & Handtasche</h2>
                <p className="text-xs text-neutral-400">Parkbank-Ausrüstung & Gear</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast("🪙 Oma-Groschen erhältst du durch das Abschließen von Missionen und Treffer im Park!")}
                className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 transition-transform active:scale-95 hover:bg-amber-500/25"
                title="Wie bekomme ich Groschen?"
              >
                <span>🪙</span>
                <span>{currentCoins}</span>
                <span className="hidden sm:inline">Groschen</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/80 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {toastMessage && (
            <div className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-center text-xs font-medium text-emerald-300">
              {toastMessage}
            </div>
          )}

          <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab("shop")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${activeTab === "shop" ? "bg-amber-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              <span>🏪</span>Kiosk</button>
            <button
              type="button"
              onClick={() => { setActiveTab("inventory"); setHasNewItemInModal(false); if (typeof window !== "undefined") { window.dispatchEvent(new CustomEvent("kiosk:cleared_notification")); } }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${activeTab === "inventory" ? "bg-amber-600 text-white shadow" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              <span>👜</span> <span>Handtasche ({ownedItems.length})</span>{hasNewItemInModal && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
            </button>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("alle")}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-medium ${selectedCategory === "alle" ? "bg-neutral-200 text-neutral-900 font-semibold" : "bg-neutral-800 text-neutral-400"}`}
            >
              Alle
            </button>
            {SHOP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-medium ${selectedCategory === cat.id ? "bg-neutral-200 text-neutral-900 font-semibold" : "bg-neutral-800 text-neutral-400"}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3.5">
          {visibleItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-500">
              Keine Gegenstände vorhanden.
            </div>
          ) : (
            visibleItems.map((item) => {
              const purchased = isItemPurchased(inventory, item.id);
              const isEq = isItemEquipped(equipped, item);
              const canAfford = currentCoins >= item.price;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 ${isEq ? "border-amber-500/60 bg-amber-500/10" : "border-neutral-800 bg-neutral-900/90"}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div onClick={(e) => {
  if (item.category === "skin") {
    e.stopPropagation();
    const isGold = item.id === "skin_golden_parabellum";
    setPreviewItem({ name: item.name, type: "skin", idle: isGold ? "/assets/oma-goldenpara.png" : "/assets/oma.png", shoot: isGold ? "/assets/oma-goldenpara-recoil.png" : "/assets/oma-recoil.png" });
  } else if (item.category === "visier") {
    e.stopPropagation();
    setPreviewItem({ name: item.name, type: "visier", color: item.crosshairColor || "#ffffff" });
  }
}} style={{
  borderColor: item.rarity === "legendaer" ? "#f59e0b" : item.rarity === "episch" ? "#a855f7" : item.rarity === "selten" ? "#0ea5e9" : "#525252",
  borderWidth: "1.5px",
  borderStyle: "solid"
}} className={`relative flex items-center justify-center rounded-lg p-1 select-none ${(item.category === "skin" || item.category === "visier") ? "cursor-pointer hover:bg-neutral-800 active:scale-95 shadow-sm" : ""}`}>
  <span className="text-2xl">{item.icon}</span>
  {(item.category === "skin" || item.category === "visier") && <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] text-black font-black">▶</span>}
</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-neutral-100">{item.name}</span>
                        {isEq && <span className="rounded bg-amber-500/30 px-1 text-[9px] font-bold text-amber-300">Aktiv</span>}
                      </div>
                      <p className="line-clamp-1 text-[11px] text-neutral-400">{item.description}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {activeTab === "shop" ? (
                      purchased ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-default rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-[11px] font-medium text-neutral-500"
                        >
                          Liegt unterm Strickzeug
                        </button>
                      ) : (item.minLevel && (getPlayerLevel(profile.totalXp || 0) < item.minLevel)) ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-lg border border-amber-900/40 bg-amber-950/30 px-2.5 py-1 text-[11px] font-medium text-amber-500/80"
                        >
                          🔒 Ab Level {item.minLevel} (Lv. {getPlayerLevel(profile.totalXp || 0)})
                        </button>
                      ) : item.available === false ? (
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
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${canAfford ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-neutral-800 text-neutral-500"}`}
                        >
                          {item.price === 0 ? "Gratis" : `${item.price} 🪙`}
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleEquip(item)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${isEq ? "bg-neutral-800 text-amber-300" : "bg-amber-600 text-white"}`}
                      >
                        {isEq ? "Ablegen" : "Ausrüsten"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      <SkinPreviewModal isOpen={previewItem !== null} onClose={() => setPreviewItem(null)} title={previewItem?.name || ""} type={previewItem?.type} idleSrc={previewItem?.idle} shootSrc={previewItem?.shoot} crosshairColor={previewItem?.color} />
      </div>
    </div>
  );
};