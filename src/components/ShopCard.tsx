"use client";

import { RARITY_STYLES, type Rarity } from "@/lib/data/characters";

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ShopCard({
  emoji,
  name,
  rarity,
  description,
  price,
  currency,
  owned,
  equipped,
  msRemaining,
  disabled,
  onBuy,
  onEquip,
}: {
  emoji: string;
  name: string;
  rarity: Rarity;
  description: string;
  price: number;
  currency: "coins" | "diamonds";
  owned: boolean;
  equipped?: boolean;
  msRemaining?: number | null;
  disabled?: boolean;
  onBuy?: () => void;
  onEquip?: () => void;
}) {
  const style = RARITY_STYLES[rarity] ?? RARITY_STYLES.COMMON;

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 bg-slate-900/80 p-3 ${style.border} ${style.glow} transition hover:-translate-y-0.5`}
    >
      <div className="flex h-20 items-center justify-center rounded-xl bg-black/30 text-5xl">{emoji}</div>
      <div className={`mt-2 self-start rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${style.badge}`}>
        {rarity}
      </div>
      <h3 className="mt-1 text-sm font-bold text-white">{name}</h3>
      <p className="mt-0.5 line-clamp-2 flex-1 text-xs text-slate-400">{description}</p>

      {msRemaining != null && msRemaining > 0 && (
        <div className="mt-1 text-[10px] font-semibold text-rose-300">⏳ {formatCountdown(msRemaining)} left</div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-white">
          {price === 0 ? "FREE" : `${currency === "diamonds" ? "💎" : "🪙"} ${price.toLocaleString()}`}
        </span>
      </div>

      {owned ? (
        equipped ? (
          <button
            disabled
            className="mt-2 rounded-lg bg-emerald-700/60 py-1.5 text-xs font-bold text-white"
          >
            EQUIPPED
          </button>
        ) : onEquip ? (
          <button
            onClick={onEquip}
            className="mt-2 rounded-lg bg-sky-600 py-1.5 text-xs font-bold text-white active:scale-95"
          >
            EQUIP
          </button>
        ) : (
          <button disabled className="mt-2 rounded-lg bg-slate-700 py-1.5 text-xs font-bold text-white">
            OWNED
          </button>
        )
      ) : (
        <button
          onClick={onBuy}
          disabled={disabled}
          className="mt-2 rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-black active:scale-95 disabled:opacity-40"
        >
          BUY
        </button>
      )}
    </div>
  );
}
