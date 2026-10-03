// =============================================================================
// GAME ENGINE — shared types
// =============================================================================

export type PlayerState =
  | "running"
  | "jumping"
  | "double_jumping"
  | "sliding"
  | "falling"
  | "hit"
  | "invincible"
  | "dead";

export type AvoidMethod = "jump" | "slide" | "lane";

export type ObstacleKind =
  | "rock"
  | "box"
  | "spike"
  | "barrier"
  | "fire"
  | "vehicle"
  | "low_barrier"
  | "pipe"
  | "electric_beam"
  | "moving_platform"
  | "drone"
  | "rotating_blade";

export type EnemyKind = "robot" | "drone" | "monster" | "flying_enemy" | "chasing_enemy";

export type PowerupKind =
  | "shield"
  | "magnet"
  | "speed"
  | "coin_x2"
  | "diamond_magnet"
  | "slow_mo"
  | "invincible";

export interface LaneEntity {
  id: number;
  lane: number; // 0,1,2
  y: number; // 0 (spawn, far) -> 1 (player row, near)
  kind: string;
  avoid?: AvoidMethod;
  hp?: number;
  maxHp?: number;
  isBoss?: boolean;
  isMiniBoss?: boolean;
  collected?: boolean;
  destroyed?: boolean;
}

export interface ActivePowerup {
  kind: PowerupKind;
  remaining: number; // seconds
  duration: number;
}

export interface GameSnapshot {
  running: boolean;
  paused: boolean;
  gameOver: boolean;
  distance: number;
  score: number;
  coins: number;
  diamonds: number;
  combo: number;
  comboMultiplier: number;
  lane: number;
  laneVisual: number;
  playerY: number; // visual vertical offset (negative = airborne)
  playerState: PlayerState;
  health: number;
  maxHealth: number;
  obstacles: LaneEntity[];
  coinsOnField: LaneEntity[];
  diamondsOnField: LaneEntity[];
  powerupsOnField: LaneEntity[];
  enemies: LaneEntity[];
  activePowerups: ActivePowerup[];
  abilityCooldown: number;
  abilityMaxCooldown: number;
  worldId: string;
  worldName: string;
  bossActive: boolean;
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  bossHitsTaken: number;
  jumps: number;
  powerupsUsed: number;
  bossesDefeated: number;
}
