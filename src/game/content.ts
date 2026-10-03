// =============================================================================
// GAMEPLAY CONTENT — obstacles, enemies, power-ups and boss definitions.
// Pure data; the engine consumes these to spawn/resolve entities, so adding
// new content means adding one entry here.
// =============================================================================

import type { AvoidMethod, ObstacleKind, EnemyKind, PowerupKind } from "./types";

export const OBSTACLES: { kind: ObstacleKind; avoid: AvoidMethod; label: string; emoji: string }[] = [
  { kind: "box", avoid: "jump", label: "Box", emoji: "📦" },
  { kind: "spike", avoid: "jump", label: "Spike", emoji: "🔺" },
  { kind: "fire", avoid: "jump", label: "Fire", emoji: "🔥" },
  { kind: "low_barrier", avoid: "jump", label: "Low Barrier", emoji: "🚧" },
  { kind: "electric_beam", avoid: "slide", label: "Electric Beam", emoji: "⚡" },
  { kind: "pipe", avoid: "slide", label: "Pipe", emoji: "🧪" },
  { kind: "rotating_blade", avoid: "slide", label: "Rotating Blade", emoji: "🌀" },
  { kind: "drone", avoid: "slide", label: "Drone", emoji: "🛸" },
  { kind: "rock", avoid: "lane", label: "Rock", emoji: "🪨" },
  { kind: "barrier", avoid: "lane", label: "Barrier", emoji: "🚫" },
  { kind: "vehicle", avoid: "lane", label: "Vehicle", emoji: "🚗" },
  { kind: "moving_platform", avoid: "lane", label: "Moving Platform", emoji: "🛤️" },
];

export const ENEMIES: { kind: EnemyKind; avoid: AvoidMethod; label: string; emoji: string; hp: number }[] = [
  { kind: "robot", avoid: "jump", label: "Robot", emoji: "🤖", hp: 20 },
  { kind: "drone", avoid: "slide", label: "Drone", emoji: "🛸", hp: 15 },
  { kind: "monster", avoid: "jump", label: "Monster", emoji: "👹", hp: 30 },
  { kind: "flying_enemy", avoid: "slide", label: "Flying Enemy", emoji: "🦇", hp: 15 },
  { kind: "chasing_enemy", avoid: "lane", label: "Chasing Enemy", emoji: "🐺", hp: 25 },
];

export const POWERUPS: { kind: PowerupKind; label: string; emoji: string; duration: number }[] = [
  { kind: "shield", label: "Shield", emoji: "🛡️", duration: 8 },
  { kind: "magnet", label: "Magnet", emoji: "🧲", duration: 8 },
  { kind: "speed", label: "Speed Boost", emoji: "🚀", duration: 6 },
  { kind: "coin_x2", label: "Double Coins", emoji: "💰", duration: 10 },
  { kind: "diamond_magnet", label: "Diamond Magnet", emoji: "💎", duration: 8 },
  { kind: "slow_mo", label: "Slow Motion", emoji: "🐌", duration: 6 },
  { kind: "invincible", label: "Invincibility", emoji: "✨", duration: 5 },
];

export const MINI_BOSSES: Record<string, { name: string; emoji: string; hp: number }> = {
  "Robot Guardian": { name: "Robot Guardian", emoji: "🤖", hp: 100 },
  "Giant Spider": { name: "Giant Spider", emoji: "🕷️", hp: 110 },
  "Flying Drone": { name: "Flying Drone", emoji: "🛸", hp: 90 },
  Monster: { name: "Monster", emoji: "👹", hp: 120 },
};

export const BOSS_EMOJI: Record<string, string> = {
  "Giant Beast": "🐗",
  "Mega Robot": "🤖",
  "Sand Monster": "🏜️",
  "Ice Titan": "🧊",
  "Fire Dragon": "🐉",
  "Alien Guardian": "👽",
  "Cyber Overlord": "🦾",
};

export const COMBO_THRESHOLDS: { count: number; multiplier: number }[] = [
  { count: 0, multiplier: 1 },
  { count: 10, multiplier: 2 },
  { count: 25, multiplier: 3 },
  { count: 50, multiplier: 4 },
  { count: 100, multiplier: 5 },
];

export function comboMultiplierFor(count: number): number {
  let m = 1;
  for (const t of COMBO_THRESHOLDS) {
    if (count >= t.count) m = t.multiplier;
  }
  return m;
}
