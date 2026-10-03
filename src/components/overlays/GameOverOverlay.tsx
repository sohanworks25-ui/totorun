"use client";

export default function GameOverOverlay({
  score,
  highestScore,
  distance,
  coins,
  diamonds,
  xpGained,
  missionsCompleted,
  bossesDefeated,
  isNewHighScore,
  onPlayAgain,
  onShop,
  onMainMenu,
}: {
  score: number;
  highestScore: number;
  distance: number;
  coins: number;
  diamonds: number;
  xpGained: number;
  missionsCompleted: number;
  bossesDefeated: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onShop: () => void;
  onMainMenu: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">
        <h2 className="text-3xl font-black tracking-wide text-rose-400">GAME OVER</h2>
        {isNewHighScore && (
          <div className="mt-2 animate-pulse rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">
            🏆 NEW HIGH SCORE!
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm text-slate-200">
          <Stat label="Score" value={score.toLocaleString()} />
          <Stat label="Best Score" value={highestScore.toLocaleString()} />
          <Stat label="Distance" value={`${distance.toLocaleString()}m`} />
          <Stat label="XP Gained" value={`+${xpGained}`} />
          <Stat label="Coins" value={`🪙 ${coins}`} />
          <Stat label="Diamonds" value={`💎 ${diamonds}`} />
          <Stat label="Missions" value={`${missionsCompleted} completed`} />
          <Stat label="Bosses" value={`${bossesDefeated} defeated`} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="rounded-xl bg-emerald-600 py-3 text-sm font-bold tracking-wide text-white shadow active:scale-95"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onShop}
            className="rounded-xl bg-sky-600 py-3 text-sm font-bold tracking-wide text-white shadow active:scale-95"
          >
            SHOP
          </button>
          <button
            onClick={onMainMenu}
            className="rounded-xl bg-slate-700 py-3 text-sm font-bold tracking-wide text-white shadow active:scale-95"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-bold text-white">{value}</div>
    </div>
  );
}
