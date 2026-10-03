"use client";

import { useState } from "react";
import ScreenHeader from "@/components/ScreenHeader";
import ShopCard from "@/components/ShopCard";
import { useGameData } from "@/store/GameDataContext";
import { api } from "@/lib/client/api";
import type { Rarity } from "@/lib/data/characters";

const CHARACTER_EMOJI: Record<string, string> = {
  runner: "🏃",
  speedster: "💨",
  jumper: "🦘",
  collector: "🧲",
  tank: "🛡️",
  shadow_runner: "🥷",
  cyber_ninja: "🤖",
  golden_runner: "👑",
  galaxy_runner: "🌌",
  phoenix_runner: "🔥",
};

export default function CharactersScreen({ onBack }: { onBack: () => void }) {
  const { characters, refreshAll } = useGameData();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (characterId: string) => {
    setBusy(characterId);
    setError(null);
    try {
      const res = await api.unlockCharacter(characterId);
      if (res.result.status === "insufficient_funds") {
        setError("Not enough currency for this character.");
      } else {
        await refreshAll();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unlock character");
    } finally {
      setBusy(null);
    }
  };

  const handleEquip = async (characterId: string) => {
    setBusy(characterId);
    try {
      await api.equip("character", characterId);
      await refreshAll();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <ScreenHeader title="CHARACTERS" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        {error && <p className="mb-3 rounded-lg bg-rose-900/60 p-2 text-center text-xs text-rose-200">{error}</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {characters.map((c) => (
            <ShopCard
              key={c.id}
              emoji={CHARACTER_EMOJI[c.id] ?? "🏃"}
              name={c.name}
              rarity={c.rarity as Rarity}
              description={`${c.description} • Ability: ${c.ability}`}
              price={c.unlockPrice}
              currency={c.unlockCurrency as "coins" | "diamonds"}
              owned={c.owned}
              equipped={c.equipped}
              disabled={busy === c.id}
              onBuy={() => handleUnlock(c.id)}
              onEquip={() => handleEquip(c.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
