"use client";

import { useState } from "react";
import ScreenHeader from "@/components/ScreenHeader";
import ShopCard from "@/components/ShopCard";
import { useGameData } from "@/store/GameDataContext";
import { api } from "@/lib/client/api";
import type { Rarity } from "@/lib/data/characters";

export default function SkinsScreen({ onBack }: { onBack: () => void }) {
  const { skins, refreshAll } = useGameData();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (skinId: string) => {
    setBusy(skinId);
    setError(null);
    try {
      const res = await api.unlockSkin(skinId);
      if (res.result.status === "insufficient_funds") {
        setError("Not enough currency for this skin.");
      } else {
        await refreshAll();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unlock skin");
    } finally {
      setBusy(null);
    }
  };

  const handleEquip = async (skinId: string) => {
    setBusy(skinId);
    try {
      await api.equip("skin", skinId);
      await refreshAll();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <ScreenHeader title="SKINS" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        {error && <p className="mb-3 rounded-lg bg-rose-900/60 p-2 text-center text-xs text-rose-200">{error}</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {skins.map((s) => (
            <ShopCard
              key={s.id}
              emoji="🎨"
              name={s.name}
              rarity={s.rarity as Rarity}
              description={s.description}
              price={s.price}
              currency={s.currency as "coins" | "diamonds"}
              owned={s.owned}
              equipped={s.equipped}
              disabled={busy === s.id}
              onBuy={() => handleUnlock(s.id)}
              onEquip={() => handleEquip(s.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
