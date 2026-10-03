"use client";

import { useGameData } from "@/store/GameDataContext";
import type { Screen } from "@/components/screenTypes";

const MENU_BUTTONS: { label: string; screen: Screen; emoji: string }[] = [
  { label: "PLAY", screen: "game", emoji: "▶️" },
  { label: "CHARACTERS", screen: "characters", emoji: "🏃" },
  { label: "SKINS", screen: "skins", emoji: "🎨" },
  { label: "SHOP", screen: "shop", emoji: "🛍️" },
  { label: "MISSIONS", screen: "missions", emoji: "🎯" },
  { label: "ACHIEVEMENTS", screen: "achievements", emoji: "🏆" },
  { label: "DAILY REWARD", screen: "daily", emoji: "🎁" },
  { label: "LEADERBOARD", screen: "leaderboard", emoji: "📊" },
  { label: "PROFILE", screen: "profile", emoji: "👤" },
  { label: "SETTINGS", screen: "settings", emoji: "⚙️" },
];

export default function MainMenu({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { profile, characters, online } = useGameData();
  const selected = characters.find((c) => c.id === profile?.selectedCharacter);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5 pb-8 pt-10 text-white">
      {!online && (
        <div className="mb-3 rounded-lg bg-amber-600/80 px-3 py-1.5 text-center text-xs font-semibold">
          Offline — playing with cached data. Progress will sync when back online.
        </div>
      )}

      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-emerald-400 drop-shadow">SKYLINE DASH</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Endless Runner</p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
        <Stat label="Level" value={profile?.level ?? 1} />
        <Stat label="Best Score" value={(profile?.highestScore ?? 0).toLocaleString()} />
        <Stat label="Character" value={selected?.name ?? "Runner"} />
        <Stat label="🪙 Coins" value={(profile?.coins ?? 0).toLocaleString()} highlight="text-yellow-300" />
        <Stat label="💎 Diamonds" value={(profile?.diamonds ?? 0).toLocaleString()} highlight="text-sky-300" />
        <Stat label="Distance" value={`${(profile?.totalDistance ?? 0).toLocaleString()}m`} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {MENU_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => onNavigate(btn.screen)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold tracking-wide shadow-lg transition active:scale-95 ${
              btn.screen === "game"
                ? "col-span-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg text-black"
                : "bg-slate-800/80 text-white hover:bg-slate-700/80"
            }`}
          >
            <span>{btn.emoji}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`truncate text-sm font-bold ${highlight ?? "text-white"}`}>{value}</div>
    </div>
  );
}
