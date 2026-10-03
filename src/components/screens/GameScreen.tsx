"use client";

import { useCallback, useRef, useState } from "react";
import GameCanvas, { type GameCanvasHandle } from "@/components/GameCanvas";
import HUD from "@/components/HUD";
import TouchControls from "@/components/TouchControls";
import PauseOverlay from "@/components/overlays/PauseOverlay";
import GameOverOverlay from "@/components/overlays/GameOverOverlay";
import { useGameData } from "@/store/GameDataContext";
import { api } from "@/lib/client/api";
import { xpToNextLevel } from "@/lib/economy/levels";
import type { GameSnapshot } from "@/game/types";
import type { CharacterStats } from "@/game/engine";

export default function GameScreen({
  onExitToMenu,
  onOpenShop,
  onOpenSettings,
}: {
  onExitToMenu: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}) {
  const { profile, characters, skins, upgrades, powerupCharges, settings, refreshAll } = useGameData();
  const canvasRef = useRef<GameCanvasHandle>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [paused, setPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    highestScore: number;
    distance: number;
    coins: number;
    diamonds: number;
    xpGained: number;
    missionsCompleted: number;
    bossesDefeated: number;
    isNewHighScore: boolean;
  }>(null);

  const selectedCharacter = characters.find((c) => c.id === profile?.selectedCharacter) ?? characters[0];
  const selectedSkin = skins.find((s) => s.id === profile?.selectedSkin);

  const characterStats: CharacterStats = selectedCharacter
    ? {
        id: selectedCharacter.id,
        speed: selectedCharacter.speed,
        jumpPower: selectedCharacter.jumpPower,
        health: selectedCharacter.health,
        ability: selectedCharacter.ability,
      }
    : { id: "runner", speed: 5, jumpPower: 5, health: 100, ability: "Steady Pace" };

  const upgradeLevels = {
    speed: upgrades.speed ?? 0,
    jump: upgrades.jump ?? 0,
    shield_duration: upgrades.shield_duration ?? 0,
    magnet_radius: upgrades.magnet_radius ?? 0,
    coin_multiplier: upgrades.coin_multiplier ?? 0,
    powerup_duration: upgrades.powerup_duration ?? 0,
    health: upgrades.health ?? 0,
  };

  const handleGameOver = useCallback(
    async (finalSnapshot: GameSnapshot) => {
      const prevHighScore = profile?.highestScore ?? 0;
      try {
        const res = await api.submitRun({
          score: finalSnapshot.score,
          distance: finalSnapshot.distance,
          coinsCollected: finalSnapshot.coins,
          diamondsCollected: finalSnapshot.diamonds,
          jumps: finalSnapshot.jumps,
          powerupsUsed: finalSnapshot.powerupsUsed,
          bossesDefeated: finalSnapshot.bossesDefeated,
        });
        setResult({
          score: finalSnapshot.score,
          highestScore: res.user.highestScore,
          distance: finalSnapshot.distance,
          coins: finalSnapshot.coins,
          diamonds: finalSnapshot.diamonds,
          xpGained: res.xpGained,
          missionsCompleted: res.completedMissions.length,
          bossesDefeated: finalSnapshot.bossesDefeated,
          isNewHighScore: res.isNewHighScore,
        });
      } catch {
        setResult({
          score: finalSnapshot.score,
          highestScore: Math.max(prevHighScore, finalSnapshot.score),
          distance: finalSnapshot.distance,
          coins: finalSnapshot.coins,
          diamonds: finalSnapshot.diamonds,
          xpGained: 0,
          missionsCompleted: 0,
          bossesDefeated: finalSnapshot.bossesDefeated,
          isNewHighScore: finalSnapshot.score > prevHighScore,
        });
      } finally {
        refreshAll();
      }
    },
    [profile, refreshAll],
  );

  if (!selectedCharacter) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        <p>Loading runner…</p>
      </div>
    );
  }

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpNext = xpToNextLevel(level);
  const abilityCooldownPct = snapshot ? snapshot.abilityCooldown / snapshot.abilityMaxCooldown : 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <GameCanvas
        ref={canvasRef}
        character={characterStats}
        playerColor={selectedCharacter.colorHex}
        skinColor={selectedSkin?.colorHex ?? "#94a3b8"}
        upgrades={upgradeLevels}
        powerupCharges={{ ...powerupCharges }}
        graphicsQuality={settings.graphicsQuality}
        onSnapshot={setSnapshot}
        onGameOver={handleGameOver}
        paused={paused || !!result}
      />

      {snapshot && !result && (
        <>
          <HUD snapshot={snapshot} level={level} xp={xp} xpToNext={xpNext} onPause={() => setPaused(true)} />
          <TouchControls
            abilityCooldownPct={abilityCooldownPct}
            onJump={() => canvasRef.current?.jump()}
            onSlide={() => canvasRef.current?.slide()}
            onAbility={() => canvasRef.current?.ability()}
            onPowerup={(kind) => canvasRef.current?.usePowerup(kind)}
            powerupCharges={powerupCharges}
          />
        </>
      )}

      {paused && !result && !showSettings && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onRestart={() => {
            canvasRef.current?.restart();
            setPaused(false);
          }}
          onSettings={() => setShowSettings(true)}
          onMainMenu={onExitToMenu}
        />
      )}

      {showSettings && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 text-center text-white">
            <p className="mb-4 text-sm text-slate-300">
              Full settings (audio, graphics, vibration…) live in the main menu Settings screen.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold"
                onClick={() => setShowSettings(false)}
              >
                BACK TO PAUSE
              </button>
              <button
                className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold"
                onClick={onOpenSettings}
              >
                GO TO SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <GameOverOverlay
          {...result}
          onPlayAgain={() => {
            setResult(null);
            setPaused(false);
            canvasRef.current?.restart();
          }}
          onShop={onOpenShop}
          onMainMenu={onExitToMenu}
        />
      )}
    </div>
  );
}
