"use client";

export default function TouchControls({
  abilityCooldownPct,
  onJump,
  onSlide,
  onAbility,
  onPowerup,
  powerupCharges,
}: {
  abilityCooldownPct: number;
  onJump: () => void;
  onSlide: () => void;
  onAbility: () => void;
  onPowerup: (kind: "shield" | "magnet" | "multiplier") => void;
  powerupCharges: { shield: number; magnet: number; multiplier: number };
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto flex gap-2">
        {powerupCharges.shield > 0 && (
          <QuickButton emoji="🛡️" count={powerupCharges.shield} onClick={() => onPowerup("shield")} />
        )}
        {powerupCharges.magnet > 0 && (
          <QuickButton emoji="🧲" count={powerupCharges.magnet} onClick={() => onPowerup("magnet")} />
        )}
        {powerupCharges.multiplier > 0 && (
          <QuickButton emoji="💰" count={powerupCharges.multiplier} onClick={() => onPowerup("multiplier")} />
        )}
      </div>

      <div className="pointer-events-auto flex w-full items-end justify-between gap-3">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onSlide();
          }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-600/80 text-2xl text-white shadow-lg ring-2 ring-sky-300/40 active:scale-90 sm:h-20 sm:w-20"
          aria-label="Slide"
        >
          ⬇️
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/90 text-3xl text-white shadow-xl ring-4 ring-emerald-300/40 active:scale-90 sm:h-24 sm:w-24"
          aria-label="Jump"
        >
          ⬆️
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onAbility();
          }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-600/80 text-2xl text-white shadow-lg ring-2 ring-fuchsia-300/40 active:scale-90 disabled:opacity-40 sm:h-20 sm:w-20"
          aria-label="Ability"
        >
          ⚡
          {abilityCooldownPct > 0 && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32"
                fill="none"
                stroke="rgba(0,0,0,0.55)"
                strokeWidth="3"
                strokeDasharray={`${abilityCooldownPct * 100}, 100`}
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function QuickButton({ emoji, count, onClick }: { emoji: string; count: number; onClick: () => void }) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg text-white shadow active:scale-90"
    >
      {emoji}
      <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
        {count}
      </span>
    </button>
  );
}
