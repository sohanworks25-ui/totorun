"use client";

export default function PauseOverlay({
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}: {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-72 rounded-2xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">
        <h2 className="mb-5 text-2xl font-black tracking-wide text-white">PAUSED</h2>
        <div className="flex flex-col gap-3">
          <MenuButton label="RESUME" onClick={onResume} color="bg-emerald-600" />
          <MenuButton label="RESTART" onClick={onRestart} color="bg-sky-600" />
          <MenuButton label="SETTINGS" onClick={onSettings} color="bg-slate-700" />
          <MenuButton label="MAIN MENU" onClick={onMainMenu} color="bg-rose-700" />
        </div>
      </div>
    </div>
  );
}

function MenuButton({ label, onClick, color }: { label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-xl py-3 text-sm font-bold tracking-wide text-white shadow transition active:scale-95`}
    >
      {label}
    </button>
  );
}
