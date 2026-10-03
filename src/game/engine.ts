// =============================================================================
// GAME ENGINE — endless runner simulation. Framework-agnostic (no DOM/canvas
// code here) so it can be driven by a React component via requestAnimationFrame
// and rendered however the UI layer wants.
// =============================================================================

import { PlayerController } from "./player";
import { OBSTACLES, ENEMIES, POWERUPS, MINI_BOSSES, BOSS_EMOJI, comboMultiplierFor } from "./content";
import { WORLDS, worldForDistance } from "@/lib/data/worlds";
import type { ActivePowerup, GameSnapshot, LaneEntity, PowerupKind } from "./types";

export interface CharacterStats {
  id: string;
  speed: number; // 1-10
  jumpPower: number; // 1-10
  health: number;
  ability: string;
}

export interface UpgradeLevels {
  speed: number;
  jump: number;
  shield_duration: number;
  magnet_radius: number;
  coin_multiplier: number;
  powerup_duration: number;
  health: number;
}

export interface PowerupCharges {
  shield: number;
  magnet: number;
  multiplier: number;
}

const CHARACTER_ABILITY_EFFECT: Record<string, PowerupKind | "triple_jump" | "bulwark"> = {
  runner: "speed",
  speedster: "speed",
  jumper: "triple_jump",
  collector: "magnet",
  tank: "bulwark",
  shadow_runner: "invincible",
  cyber_ninja: "slow_mo",
  golden_runner: "coin_x2",
  galaxy_runner: "invincible",
  phoenix_runner: "invincible",
};

const COLLISION_BAND = 0.9;
const BASE_SPAWN_INTERVAL = 1.35;
const MIN_SPAWN_INTERVAL = 0.65;
const BASE_SPEED = 0.34; // "rows" per second entities travel
const DISTANCE_PER_ROW_SECOND = 9; // meters/sec at base speed
const OBSTACLE_DAMAGE = 40;
const ENEMY_DAMAGE = 30;
const ABILITY_BASE_COOLDOWN = 12;
const BOSS_ABILITY_DAMAGE = 18;
const BOSS_DODGE_DAMAGE = 6;
const MINI_BOSS_EVERY_M = 1400;
const MAJOR_BOSS_EVERY_M = 2600;

export class GameEngine {
  player = new PlayerController();
  running = false;
  paused = false;
  gameOver = false;

  distance = 0;
  score = 0;
  coins = 0;
  diamonds = 0;
  combo = 0;
  jumps = 0;
  powerupsUsed = 0;
  bossesDefeated = 0;

  obstacles: LaneEntity[] = [];
  coinEntities: LaneEntity[] = [];
  diamondEntities: LaneEntity[] = [];
  powerupEntities: LaneEntity[] = [];
  enemyEntities: LaneEntity[] = [];
  activePowerups: Map<PowerupKind, ActivePowerup> = new Map();

  nextId = 1;
  spawnTimer = 0;
  elapsed = 0; // engine clock (seconds), used for timed effects
  abilityCooldown = 0;

  lastMiniBossDistance = 0;
  lastMajorBossDistance = 0;
  bossActive = false;
  bossIsMajor = false;
  bossName = "";
  bossHp = 0;
  bossMaxHp = 0;
  bossHitsTaken = 0;
  bossTimer = 0;

  bulwarkCharges = 0;

  constructor(
    private character: CharacterStats,
    private upgrades: UpgradeLevels,
    private powerupCharges: PowerupCharges,
  ) {}

  start() {
    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.diamonds = 0;
    this.combo = 0;
    this.jumps = 0;
    this.powerupsUsed = 0;
    this.bossesDefeated = 0;
    this.obstacles = [];
    this.coinEntities = [];
    this.diamondEntities = [];
    this.powerupEntities = [];
    this.enemyEntities = [];
    this.activePowerups.clear();
    this.nextId = 1;
    this.spawnTimer = 0.6;
    this.elapsed = 0;
    this.abilityCooldown = 0;
    this.lastMiniBossDistance = 0;
    this.lastMajorBossDistance = 0;
    this.bossActive = false;
    this.bossHitsTaken = 0;
    this.bulwarkCharges = 0;

    const maxHealth = this.character.health + this.upgrades.health * 10;
    this.player.reset(maxHealth);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  private effectiveSpeed(): number {
    const upgradeBoost = 1 + this.upgrades.speed * 0.03;
    const characterBoost = 1 + (this.character.speed - 5) * 0.025;
    const difficultyBoost = 1 + Math.min(1.4, this.distance / 6000);
    const speedPowerup = this.activePowerups.has("speed") ? 1.35 : 1;
    const slowMo = this.activePowerups.has("slow_mo") ? 0.55 : 1;
    return BASE_SPEED * upgradeBoost * characterBoost * difficultyBoost * speedPowerup * slowMo;
  }

  private spawnInterval(): number {
    const difficulty = Math.min(1, this.distance / 8000);
    return BASE_SPAWN_INTERVAL - (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * difficulty;
  }

  // ---- Input -------------------------------------------------------------

  jump() {
    if (!this.running || this.paused || this.gameOver) return;
    const jumpBoost = 1 + (this.character.jumpPower - 5) * 0.02 + this.upgrades.jump * 0.02;
    const performed = this.player.jump(this.elapsed);
    if (performed) {
      this.player.vy *= jumpBoost; // higher jumpPower -> stronger jump arc
      this.jumps += 1;
    }
  }

  slide() {
    if (!this.running || this.paused || this.gameOver) return;
    this.player.slide();
  }

  moveLeft() {
    if (!this.running || this.paused || this.gameOver) return;
    this.player.moveLeft();
  }

  moveRight() {
    if (!this.running || this.paused || this.gameOver) return;
    this.player.moveRight();
  }

  useAbility() {
    if (!this.running || this.paused || this.gameOver) return;
    if (this.abilityCooldown > 0) return;

    this.abilityCooldown = ABILITY_BASE_COOLDOWN;

    if (this.bossActive) {
      this.bossHp = Math.max(0, this.bossHp - BOSS_ABILITY_DAMAGE);
      this.registerCollect();
      return;
    }

    const effect = CHARACTER_ABILITY_EFFECT[this.character.id] ?? "speed";
    const duration = 4 + this.upgrades.powerup_duration;

    if (effect === "triple_jump") {
      this.player.grantTripleJump(this.elapsed, duration);
    } else if (effect === "bulwark") {
      this.bulwarkCharges += 1;
    } else {
      this.applyPowerupEffect(effect, duration);
    }
  }

  usePowerupCharge(kind: "shield" | "magnet" | "multiplier") {
    if (!this.running || this.paused || this.gameOver) return;
    if (this.powerupCharges[kind] <= 0) return;
    this.powerupCharges[kind] -= 1;
    if (kind === "shield") this.applyPowerupEffect("shield", 8 + this.upgrades.shield_duration);
    if (kind === "magnet") this.applyPowerupEffect("magnet", 8 + this.upgrades.powerup_duration);
    if (kind === "multiplier") this.applyPowerupEffect("coin_x2", 10 + this.upgrades.powerup_duration);
    this.powerupsUsed += 1;
  }

  // ---- Core loop -----------------------------------------------------------

  update(dt: number) {
    if (!this.running || this.paused || this.gameOver) return;
    this.elapsed += dt;
    this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);

    this.player.update(dt, this.elapsed);

    if (this.player.health <= 0) {
      this.gameOver = true;
      this.running = false;
      return;
    }

    // Tick active powerups
    for (const [kind, p] of this.activePowerups) {
      p.remaining -= dt;
      if (p.remaining <= 0) this.activePowerups.delete(kind);
    }

    if (this.bossActive) {
      this.updateBossPhase(dt);
      return;
    }

    const speed = this.effectiveSpeed();
    this.distance += speed * dt * DISTANCE_PER_ROW_SECOND;
    const comboMultiplier = comboMultiplierFor(this.combo);
    this.score += speed * dt * DISTANCE_PER_ROW_SECOND * comboMultiplier * 0.5;

    this.advanceEntities(this.obstacles, speed, dt, (e) => this.resolveObstacle(e));
    this.advanceEntities(this.enemyEntities, speed, dt, (e) => this.resolveEnemy(e));
    this.advanceEntities(this.coinEntities, speed, dt, (e) => this.resolveCoin(e));
    this.advanceEntities(this.diamondEntities, speed, dt, (e) => this.resolveDiamond(e));
    this.advanceEntities(this.powerupEntities, speed, dt, (e) => this.resolvePowerup(e));

    this.applyMagnetPulls();

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnWave();
      this.spawnTimer = this.spawnInterval();
    }

    this.maybeTriggerBoss();
  }

  private advanceEntities(
    list: LaneEntity[],
    speed: number,
    dt: number,
    resolve: (e: LaneEntity) => void,
  ) {
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (e.destroyed || e.collected) {
        list.splice(i, 1);
        continue;
      }
      e.y += speed * dt;
      if (e.y >= COLLISION_BAND && e.y - speed * dt < COLLISION_BAND) {
        resolve(e);
      }
      if (e.y >= 1.15) {
        list.splice(i, 1);
      }
    }
  }

  private sameLane(e: LaneEntity) {
    return e.lane === this.player.lane;
  }

  private resolveObstacle(e: LaneEntity) {
    if (!this.sameLane(e)) return;
    const avoided =
      (e.avoid === "jump" && this.player.isAirborne) ||
      (e.avoid === "slide" && this.player.isSliding);
    if (avoided) return;

    if (this.bulwarkCharges > 0) {
      this.bulwarkCharges -= 1;
      e.destroyed = true;
      this.registerCollect();
      return;
    }

    const absorbed = this.player.takeHit(this.elapsed, OBSTACLE_DAMAGE);
    if (!absorbed) {
      this.combo = 0;
      this.player.triggerHitStun();
    }
  }

  private resolveEnemy(e: LaneEntity) {
    if (!this.sameLane(e)) return;
    const avoided =
      (e.avoid === "jump" && this.player.isAirborne) ||
      (e.avoid === "slide" && this.player.isSliding);
    if (avoided) return;

    const absorbed = this.player.takeHit(this.elapsed, ENEMY_DAMAGE);
    if (!absorbed) {
      this.combo = 0;
      this.player.triggerHitStun();
    } else {
      e.destroyed = true;
    }
  }

  private resolveCoin(e: LaneEntity) {
    if (!this.sameLane(e) || e.collected) return;
    this.collectCoin(e);
  }

  private resolveDiamond(e: LaneEntity) {
    if (!this.sameLane(e) || e.collected) return;
    this.collectDiamond(e);
  }

  private resolvePowerup(e: LaneEntity) {
    if (!this.sameLane(e) || e.collected) return;
    this.collectPowerup(e);
  }

  private collectCoin(e: LaneEntity) {
    e.collected = true;
    const multiplier = comboMultiplierFor(this.combo);
    const coinMult = this.activePowerups.has("coin_x2") ? 2 : 1;
    const permanentMult = 1 + this.upgrades.coin_multiplier * 0.05;
    const gained = Math.round(1 * multiplier * coinMult * permanentMult);
    this.coins += gained;
    this.score += 5 * multiplier;
    this.registerCollect();
  }

  private collectDiamond(e: LaneEntity) {
    e.collected = true;
    this.diamonds += 1;
    this.score += 25 * comboMultiplierFor(this.combo);
    this.registerCollect();
  }

  private collectPowerup(e: LaneEntity) {
    e.collected = true;
    const def = POWERUPS.find((p) => p.kind === e.kind);
    const duration = (def?.duration ?? 6) + this.upgrades.powerup_duration;
    this.applyPowerupEffect(e.kind as PowerupKind, duration);
    this.powerupsUsed += 1;
    this.registerCollect();
  }

  private applyPowerupEffect(kind: PowerupKind, duration: number) {
    if (kind === "shield") {
      this.player.grantShield(1);
    } else if (kind === "invincible") {
      this.player.grantInvincibility(this.elapsed, duration);
    }
    this.activePowerups.set(kind, { kind, remaining: duration, duration });
  }

  private applyMagnetPulls() {
    const hasMagnet = this.activePowerups.has("magnet");
    const hasDiamondMagnet = this.activePowerups.has("diamond_magnet");
    if (!hasMagnet && !hasDiamondMagnet) return;
    const radius = 0.35 + this.upgrades.magnet_radius * 0.05;

    if (hasMagnet) {
      for (const c of this.coinEntities) {
        if (!c.collected && c.y > COLLISION_BAND - radius) {
          c.lane = this.player.lane;
        }
      }
    }
    if (hasMagnet || hasDiamondMagnet) {
      for (const d of this.diamondEntities) {
        if (!d.collected && d.y > COLLISION_BAND - radius) {
          d.lane = this.player.lane;
        }
      }
    }
  }

  private registerCollect() {
    this.combo += 1;
  }

  // ---- Spawning --------------------------------------------------------

  private spawnWave() {
    const difficulty = Math.min(1, this.distance / 8000);
    const maxObstacleLanes = difficulty > 0.6 ? 2 : difficulty > 0.25 ? 2 : 1;
    const lanes = [0, 1, 2];

    const obstacleLaneCount = Math.min(
      maxObstacleLanes + (Math.random() < 0.15 * difficulty ? 1 : 0),
      2, // always guarantee at least one fully free lane
    );
    const chosenLanes = shuffle(lanes).slice(0, obstacleLaneCount);

    for (const lane of chosenLanes) {
      if (Math.random() < 0.12 && difficulty > 0.1) {
        const def = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
        this.enemyEntities.push({
          id: this.nextId++,
          lane,
          y: 0,
          kind: def.kind,
          avoid: def.avoid,
          hp: def.hp,
          maxHp: def.hp,
        });
      } else {
        const def = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        this.obstacles.push({ id: this.nextId++, lane, y: 0, kind: def.kind, avoid: def.avoid });
      }
    }

    const freeLanes = lanes.filter((l) => !chosenLanes.includes(l));
    const pickupLane = freeLanes[Math.floor(Math.random() * freeLanes.length)] ?? lanes[0];

    // Coin formations: straight / arc / staircase / zig-zag / risk-reward
    const formation = Math.random();
    if (formation < 0.55) {
      this.spawnCoinFormation(pickupLane);
    } else if (formation < 0.68 && this.distance > 150) {
      this.diamondEntities.push({ id: this.nextId++, lane: pickupLane, y: -0.05, kind: "diamond" });
    } else if (formation < 0.78) {
      const def = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
      this.powerupEntities.push({ id: this.nextId++, lane: pickupLane, y: -0.05, kind: def.kind });
    }
  }

  private spawnCoinFormation(preferredLane: number) {
    const shapes = ["straight", "arc", "staircase", "zigzag"] as const;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const count = 5;

    for (let i = 0; i < count; i++) {
      let lane = preferredLane;
      if (shape === "arc") lane = [0, 1, 2, 1, 0][i] ?? preferredLane;
      if (shape === "zigzag") lane = i % 2 === 0 ? preferredLane : (preferredLane + 1) % 3;
      if (shape === "staircase") lane = Math.min(2, Math.floor(i / 2));
      this.coinEntities.push({
        id: this.nextId++,
        lane,
        y: -0.05 - i * 0.09,
        kind: "coin",
      });
    }
  }

  private maybeTriggerBoss() {
    if (this.distance - this.lastMajorBossDistance >= MAJOR_BOSS_EVERY_M) {
      this.lastMajorBossDistance = this.distance;
      this.startBossFight(true);
      return;
    }
    if (this.distance - this.lastMiniBossDistance >= MINI_BOSS_EVERY_M) {
      this.lastMiniBossDistance = this.distance;
      this.startBossFight(false);
    }
  }

  private startBossFight(major: boolean) {
    const world = worldForDistance(this.distance);
    this.bossActive = true;
    this.bossIsMajor = major;
    this.bossHitsTaken = 0;
    this.bossTimer = 0;
    this.obstacles = [];
    this.enemyEntities = [];

    if (major) {
      this.bossName = world.boss;
      this.bossMaxHp = 220 + Math.min(300, this.distance / 20);
    } else {
      const miniName = world.miniBosses[Math.floor(Math.random() * world.miniBosses.length)];
      this.bossName = miniName;
      this.bossMaxHp = MINI_BOSSES[miniName]?.hp ?? 100;
    }
    this.bossHp = this.bossMaxHp;
  }

  private updateBossPhase(dt: number) {
    this.bossTimer += dt;
    const speed = 0.3;

    // Boss attacks fall like obstacles; dodging damages the boss slightly.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const lane = Math.floor(Math.random() * 3);
      const def = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      this.obstacles.push({ id: this.nextId++, lane, y: 0, kind: def.kind, avoid: def.avoid });
      this.spawnTimer = 1.1;
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const e = this.obstacles[i];
      e.y += speed * dt;
      if (e.y >= COLLISION_BAND && e.y - speed * dt < COLLISION_BAND) {
        if (this.sameLane(e)) {
          const avoided =
            (e.avoid === "jump" && this.player.isAirborne) ||
            (e.avoid === "slide" && this.player.isSliding);
          if (avoided) {
            this.bossHp = Math.max(0, this.bossHp - BOSS_DODGE_DAMAGE);
          } else {
            const absorbed = this.player.takeHit(this.elapsed, OBSTACLE_DAMAGE * 0.6);
            if (!absorbed) {
              this.bossHitsTaken += 1;
              this.player.triggerHitStun();
            }
          }
        } else {
          this.bossHp = Math.max(0, this.bossHp - BOSS_DODGE_DAMAGE * 0.4);
        }
      }
      if (e.y >= 1.15) this.obstacles.splice(i, 1);
    }

    if (this.bossHp <= 0) {
      this.bossesDefeated += 1;
      this.score += this.bossIsMajor ? 2000 : 500;
      this.coins += this.bossIsMajor ? 500 : 150;
      this.diamonds += this.bossIsMajor ? 25 : 5;
      this.obstacles = [];
      this.bossActive = false;
      this.spawnTimer = 0.8;
    } else if (this.bossHitsTaken >= 3 || this.bossTimer > 45) {
      // fail-safe: boss retreats after too many hits or too long, no reward,
      // keeps the game friendly and never ends the run.
      this.obstacles = [];
      this.bossActive = false;
      this.spawnTimer = 0.8;
    }
  }

  // ---- Snapshot ----------------------------------------------------------

  getSnapshot(): GameSnapshot {
    const world = worldForDistance(this.distance);
    return {
      running: this.running,
      paused: this.paused,
      gameOver: this.gameOver,
      distance: Math.floor(this.distance),
      score: Math.floor(this.score),
      coins: this.coins,
      diamonds: this.diamonds,
      combo: this.combo,
      comboMultiplier: comboMultiplierFor(this.combo),
      lane: this.player.lane,
      laneVisual: this.player.laneVisual,
      playerY: this.player.y,
      playerState: this.player.state,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      obstacles: this.obstacles,
      coinsOnField: this.coinEntities,
      diamondsOnField: this.diamondEntities,
      powerupsOnField: this.powerupEntities,
      enemies: this.enemyEntities,
      activePowerups: Array.from(this.activePowerups.values()),
      abilityCooldown: this.abilityCooldown,
      abilityMaxCooldown: ABILITY_BASE_COOLDOWN,
      worldId: world.id,
      worldName: world.name,
      bossActive: this.bossActive,
      bossName: this.bossName,
      bossHp: Math.max(0, Math.ceil(this.bossHp)),
      bossMaxHp: Math.ceil(this.bossMaxHp),
      bossHitsTaken: this.bossHitsTaken,
      jumps: this.jumps,
      powerupsUsed: this.powerupsUsed,
      bossesDefeated: this.bossesDefeated,
    };
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { WORLDS, BOSS_EMOJI, MINI_BOSSES };
