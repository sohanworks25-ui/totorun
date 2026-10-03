"use client";

import { useMemo, useState } from "react";
import ScreenHeader from "@/components/ScreenHeader";
import ShopCard from "@/components/ShopCard";
import { useGameData } from "@/store/GameDataContext";
import { api } from "@/lib/client/api";
import { launchPurchase } from "@/lib/monetization/billingClient";
import type { Rarity } from "@/lib/data/characters";

const CATEGORY_EMOJI: Record<string, string> = {
  character: "🏃",
  skin: "🎨",
  trail: "💫",
  effect: "✨",
  powerup: "⭐",
  upgrade: "🔧",
};

const CATEGORIES = [
  "FEATURED",
  "CHARACTERS",
  "SKINS",
  "TRAILS",
  "EFFECTS",
  "POWER-UPS",
  "UPGRADES",
  "DIAMONDS",
  "COINS",
  "EVENT ITEMS",
] as const;

export default function ShopScreen({ onBack }: { onBack: () => void }) {
  const { shopItems, iapProducts, refreshShop, profile, refreshProfile } = useGameData();
  const [tab, setTab] = useState<(typeof CATEGORIES)[number]>("FEATURED");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    if (tab === "FEATURED") return shopItems.filter((i) => i.featured);
    if (tab === "DIAMONDS" || tab === "COINS") return [];
    return shopItems.filter((i) => i.category === tab);
  }, [shopItems, tab]);

  const visibleProducts = useMemo(() => {
    if (tab === "DIAMONDS") return iapProducts.filter((p) => p.type === "diamonds");
    if (tab === "COINS") return iapProducts.filter((p) => p.type === "coins");
    return [];
  }, [iapProducts, tab]);

  const buyShopItem = async (id: string) => {
    setBusy(id);
    setMessage(null);
    try {
      await api.buyShopItem(id);
      await Promise.all([refreshShop(), refreshProfile()]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBusy(null);
    }
  };

  const buyIapProduct = async (productId: string) => {
    setBusy(productId);
    setMessage(null);
    try {
      const res = await launchPurchase(productId);
      setMessage(
        res.status === "already_processed"
          ? "This purchase was already processed."
          : `Purchase successful! Wallet updated.`,
      );
      await refreshProfile();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <ScreenHeader
        title="SHOP"
        onBack={onBack}
        right={
          <div className="flex items-center gap-1 text-[11px] font-bold text-white">
            <span className="text-yellow-300">🪙{profile?.coins ?? 0}</span>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-slate-900/60 px-3 py-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
              tab === c ? "bg-emerald-500 text-black" : "bg-white/10 text-slate-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {message && (
          <p className="mb-3 rounded-lg bg-sky-900/60 p-2 text-center text-xs text-sky-200">{message}</p>
        )}

        {visibleProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibleProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center rounded-2xl border-2 border-sky-500/40 bg-slate-900/80 p-4 text-center"
              >
                <div className="text-4xl">{p.type === "diamonds" ? "💎" : "🪙"}</div>
                <div className="mt-1 text-lg font-black text-white">
                  {p.amount.toLocaleString()}
                  {p.bonus > 0 && <span className="ml-1 text-xs text-emerald-400">+{p.bonus}</span>}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{p.description}</p>
                <button
                  onClick={() => buyIapProduct(p.id)}
                  disabled={busy === p.id}
                  className="mt-3 w-full rounded-lg bg-amber-500 py-2 text-xs font-bold text-black active:scale-95 disabled:opacity-40"
                >
                  {busy === p.id ? "PROCESSING…" : "BUY"}
                </button>
                <p className="mt-1 text-[9px] text-slate-500">
                  Price set by Google Play Console (localized)
                </p>
              </div>
            ))}
          </div>
        )}

        {visibleItems.length === 0 && visibleProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-500">No items in this category right now.</p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleItems.map((item) => (
            <ShopCard
              key={item.id}
              emoji={CATEGORY_EMOJI[item.refItemType] ?? "🎁"}
              name={item.name}
              rarity={item.rarity as Rarity}
              description={item.description}
              price={item.currentPrice}
              currency={item.currency as "coins" | "diamonds"}
              owned={item.owned}
              msRemaining={item.msRemaining}
              disabled={busy === item.id}
              onBuy={() => buyShopItem(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
