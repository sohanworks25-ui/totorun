// =============================================================================
// PLAYER CONTROLLER — physics, lane movement, state machine for the runner.
// =============================================================================

import type { PlayerState } from "./types";

const GRAVITY = 26; // units/s^2 (unit = normalized "lane row height")
const JUMP_VELOCITY = -9.2;
const DOUBLE_JUMP_VELOCITY = -7.8;
const SLIDE_DURATION = 0.55;
const LANE_LERP_SPEED = 14;

export class PlayerController {
  lane = 1; // 0,1,2 (left, middle, right)
  laneVisual = 1;
  y = 0; // 0 = grounded, negative = airborne (up)
  vy = 0;
  state: PlayerState = "running";
  slideTimer = 0;
  doubleJumpAvailable = false;
  tripleJumpUntil = 0; // timestamp (seconds, engine clock) extra jump charge window
  health = 100;
  maxHealth = 100;
  invincibleUntil = 0;
  shieldCharges = 0; // absorbs one hit each
  jumpsPerformed = 0;

  reset(maxHealth: number) {
    this.lane = 1;
    this.laneVisual = 1;
    this.y = 0;
    this.vy = 0;
    this.state = "running";
    this.slideTimer = 0;
    this.doubleJumpAvailable = false;
    this.tripleJumpUntil = 0;
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.invincibleUntil = 0;
    this.shieldCharges = 0;
    this.jumpsPerformed = 0;
  }

  get grounded() {
    return this.y >= 0 && this.state !== "jumping" && this.state !== "double_jumping";
  }

  get isAirborne() {
    return this.state === "jumping" || this.state === "double_jumping";
  }

  get isSliding() {
    return this.state === "sliding";
  }

  isInvincibleAt(now: number) {
    return this.invincibleUntil > now;
  }

  moveLeft() {
    if (this.lane > 0) this.lane -= 1;
  }

  moveRight() {
    if (this.lane < 2) this.lane += 1;
  }

  jump(now: number): boolean {
    if (this.state === "dead" || this.state === "hit") return false;
    if (this.isSliding) return false;

    if (!this.isAirborne) {
      this.vy = JUMP_VELOCITY;
      this.state = "jumping";
      this.doubleJumpAvailable = true;
      this.jumpsPerformed += 1;
      return true;
    }

    const hasTripleJump = now < this.tripleJumpUntil;
    if (this.doubleJumpAvailable || hasTripleJump) {
      this.vy = DOUBLE_JUMP_VELOCITY;
      this.state = "double_jumping";
      this.doubleJumpAvailable = hasTripleJump ? this.doubleJumpAvailable : false;
      this.jumpsPerformed += 1;
      return true;
    }

    return false;
  }

  slide() {
    if (this.state === "dead" || this.state === "hit") return;
    if (this.isAirborne) return;
    this.state = "sliding";
    this.slideTimer = SLIDE_DURATION;
  }

  grantShield(charges = 1) {
    this.shieldCharges += charges;
  }

  grantInvincibility(now: number, duration: number) {
    this.invincibleUntil = Math.max(this.invincibleUntil, now + duration);
  }

  grantTripleJump(now: number, duration: number) {
    this.tripleJumpUntil = Math.max(this.tripleJumpUntil, now + duration);
  }

  /** Returns true if the hit was absorbed (shield/invincibility), false if it landed. */
  takeHit(now: number, damage: number): boolean {
    if (this.invincibleUntil > now) return true;
    if (this.shieldCharges > 0) {
      this.shieldCharges -= 1;
      return true;
    }
    this.health = Math.max(0, this.health - damage);
    this.state = "hit";
    return false;
  }

  update(dt: number, now: number) {
    // Lane smoothing for rendering
    this.laneVisual += (this.lane - this.laneVisual) * Math.min(1, LANE_LERP_SPEED * dt);

    if (this.state === "hit") {
      // brief stun before resuming running
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.state = this.y < 0 ? "falling" : "running";
      }
      return;
    }

    if (this.isAirborne) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y >= 0) {
        this.y = 0;
        this.vy = 0;
        this.doubleJumpAvailable = false;
        this.state = "running";
      }
      return;
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.state = "running";
      }
      return;
    }

    if (this.state !== "dead") {
      this.state = this.health <= 0 ? "dead" : "running";
    }
  }

  triggerHitStun() {
    this.state = "hit";
    this.slideTimer = 0.35;
  }
}
