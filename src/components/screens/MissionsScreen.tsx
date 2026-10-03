"use client";

import { useState } from "react";
import ScreenHeader from "@/components/ScreenHeader";
import { useGameData } from "@/store/GameDataContext";
import { api } from "@/lib/client/api";

export default function MissionsScreen({ onBack }: { onBack: () => void }) {
  const { missions, refreshMissions, refreshProfile } = useGameData();
  const [busy, setBusy] = useState<string | null>(null);

  const claim = async (id: string) => {
    setBusy(id);
    try {
      await api.claimMission(id);
      await Promise.all([refreshMissions(), refreshProfile()]);
    } finally {
      setBusy(null);
    }
  };

  const daily = missions.filter((m) => m.type === "daily");
  const weekly = missions.filter((m) => m.type === "weekly");

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <ScreenHeader title="MISSIONS" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <Section title="Daily Missions" missions={daily} busy={busy} onClaim={claim} />
        <Section title="Weekly Missions" missions={weekly} busy={busy} onClaim={claim} />
      </div>
    </div>
  );
}

function Section({
  title,
  missions,
  busy,
  onClaim,
}: {
  title: string;
  missions: ReturnType<typeof useGameData>["missions"];
  busy: string | null;
  onClaim: (id: string) => void;
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="flex flex-col gap-2">
        {missions.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{m.title}</p>
                <p className="text-xs text-slate-400">{m.description}</p>
              </div>
              <div className="shrink-0 text-right text-[11px] text-slate-300">
                {m.rewardCoins > 0 && <div>🪙 {m.rewardCoins}</div>}
                {m.rewardDiamonds > 0 && <div>💎 {m.rewardDiamonds}</div>}
                {m.rewardXp > 0 && <div>✨ {m.rewardXp} XP</div>}
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {Math.min(m.progress, m.target)} / {m.target}
              </span>
              {m.claimed ? (
                <span className="text-[11px] font-bold text-emerald-400">CLAIMED</span>
              ) : m.completed ? (
                <button
                  onClick={() => onClaim(m.id)}
                  disabled={busy === m.id}
                  className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-black active:scale-95"
                >
                  CLAIM
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">In progress</span>
              )}
            </div>
          </div>
        ))}
        {missions.length === 0 && <p className="text-xs text-slate-500">No missions right now.</p>}
      </div>
    </div>
  );
}
