"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { GameEngine, type CharacterStats, type PowerupCharges, type UpgradeLevels } from "@/game/engine";
import { drawFrame, type GraphicsQuality } from "@/game/renderer";
import { worldForDistance } from "@/lib/data/worlds";
import type { GameSnapshot } from "@/game/types";

export interface GameCanvasHandle {
  jump: () => void;
  slide: () => void;
  ability: () => void;
  usePowerup: (kind: "shield" | "magnet" | "multiplier") => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
}

interface Props {
  character: CharacterStats;
  playerColor: string;
  skinColor: string;
  upgrades: UpgradeLevels;
  powerupCharges: PowerupCharges;
  graphicsQuality: GraphicsQuality;
  onSnapshot: (snapshot: GameSnapshot) => void;
  onGameOver: (snapshot: GameSnapshot) => void;
  paused: boolean;
}

const SWIPE_THRESHOLD = 28;

const GameCanvas = forwardRef<GameCanvasHandle, Props>(function GameCanvas(
  {
    character,
    playerColor,
    skinColor,
    upgrades,
    powerupCharges,
    graphicsQuality,
    onSnapshot,
    onGameOver,
    paused,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const gameOverFiredRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    engineRef.current = new GameEngine(character, upgrades, { ...powerupCharges });
    engineRef.current.start();
    gameOverFiredRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id]);

  useImperativeHandle(ref, () => ({
    jump: () => engineRef.current?.jump(),
    slide: () => engineRef.current?.slide(),
    ability: () => engineRef.current?.useAbility(),
    usePowerup: (kind) => engineRef.current?.usePowerupCharge(kind),
    pause: () => engineRef.current?.pause(),
    resume: () => engineRef.current?.resume(),
    restart: () => {
      engineRef.current = new GameEngine(character, upgrades, { ...powerupCharges });
      engineRef.current.start();
      gameOverFiredRef.current = false;
    },
  }));

  useEffect(() => {
    if (!paused) engineRef.current?.resume();
    else engineRef.current?.pause();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (time: number) => {
      const engine = engineRef.current;
      if (engine) {
        const dt = lastTimeRef.current ? Math.min(0.05, (time - lastTimeRef.current) / 1000) : 0;
        lastTimeRef.current = time;
        engine.update(dt);
        const snapshot = engine.getSnapshot();
        onSnapshot(snapshot);

        if (snapshot.gameOver && !gameOverFiredRef.current) {
          gameOverFiredRef.current = true;
          onGameOver(snapshot);
        }

        const parent = canvas.parentElement;
        const width = parent?.clientWidth ?? canvas.width;
        const height = parent?.clientHeight ?? canvas.height;
        const world = worldForDistance(engine.distance);
        drawFrame(ctx, width, height, snapshot, world, time / 1000, graphicsQuality, playerColor, skinColor);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphicsQuality, playerColor, skinColor]);

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
      engineRef.current?.jump(); // quick tap = jump
      return;
    }

    if (absX > absY) {
      if (dx > 0) engineRef.current?.moveRight();
      else engineRef.current?.moveLeft();
    } else {
      if (dy < 0) engineRef.current?.jump();
      else engineRef.current?.slide();
    }
  };

  return (
    <div className="relative h-full w-full touch-none select-none">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
});

export default GameCanvas;
