"use client";

import type { GameSnapshot } from "@/game/types";

const POWERUP_EMOJI: Record<string, string> = {
  shield: "🛡️",
  magnet: "🧲",
  speed: "🚀",
  coin_x2: "💰",
  diamond_magnet: "💎",
  slow_mo: "🐌",
  invincible: "✨",
};

export default function HUD({
  snapshot,
  level,
  xp,
  xpToNext,
  onPause,
}: {
  snapshot: GameSnapshot;
  level: number;
  xp: number;
  xpToNext: number;
  onPause: () => void;
}) {
  const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-1 p-2 sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-bold text-amber-300">LV {level}</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/20 sm:w-24">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        <div className="pointer-events-auto rounded-xl bg-black/50 px-3 py-1.5 text-center backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-wide text-slate-300">Score</div>
          <div className="text-sm font-bold text-white">{snapshot.score.toLocaleString()}</div>
        </div>

        <div className="pointer-events-auto flex flex-col gap-1 rounded-xl bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-semibold text-sky-300">💎 {snapshot.diamonds}</span>
          <span className="text-xs font-semibold text-yellow-300">🪙 {snapshot.coins}</span>
        </div>

        <button
          onClick={onPause}
          className="pointer-events-auto rounded-xl bg-black/50 px-3 py-2 text-lg leading-none text-white backdrop-blur-sm active:scale-95"
          aria-label="Pause"
        >
          ⏸
        </button>
      </div>

      {snapshot.combo > 1 && (
        <div className="self-center rounded-full bg-fuchsia-600/80 px-3 py-0.5 text-xs font-bold text-white shadow">
          COMBO x{snapshot.comboMultiplier} ({snapshot.combo})
        </div>
      )}

      {snapshot.activePowerups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {snapshot.activePowerups.map((p) => (
            <div
              key={p.kind}
              className="pointer-events-auto flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
            >
              <span>{POWERUP_EMOJI[p.kind] ?? "⭐"}</span>
              <div className="h-1 w-10 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${Math.max(0, (p.remaining / p.duration) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {snapshot.bossActive && (
        <div className="pointer-events-none mx-auto mt-1 w-full max-w-sm rounded-xl bg-black/60 px-3 py-1.5 text-center backdrop-blur-sm">
          <div className="text-xs font-bold tracking-wide text-rose-300">{snapshot.bossName.toUpperCase()}</div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all"
              style={{ width: `${(snapshot.bossHp / snapshot.bossMaxHp) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
