"use client";

export default function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur">
      <button
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
        aria-label="Back"
      >
        ←
      </button>
      <h1 className="text-base font-bold tracking-wide text-white">{title}</h1>
      <div className="w-9">{right}</div>
    </div>
  );
}
