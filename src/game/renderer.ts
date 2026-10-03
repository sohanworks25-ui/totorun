// =============================================================================
// CANVAS RENDERER — pure drawing functions. No game logic here, only visuals.
// Kept deliberately simple (gradients + shapes + emoji) so it stays smooth on
// low-end Android devices; the `quality` setting trims parallax/particle work.
// =============================================================================

import type { GameSnapshot } from "./types";
import type { WorldDef } from "@/lib/data/worlds";
import { OBSTACLES, ENEMIES, POWERUPS } from "./content";
import { BOSS_EMOJI, MINI_BOSSES } from "./content";

export type GraphicsQuality = "low" | "medium" | "high";

const OBSTACLE_EMOJI = Object.fromEntries(OBSTACLES.map((o) => [o.kind, o.emoji]));
const ENEMY_EMOJI = Object.fromEntries(ENEMIES.map((e) => [e.kind, e.emoji]));
const POWERUP_EMOJI = Object.fromEntries(POWERUPS.map((p) => [p.kind, p.emoji]));

function laneX(lane: number, width: number) {
  const laneWidth = width / 3;
  return laneWidth * lane + laneWidth / 2;
}

function depthY(entityY: number, height: number) {
  const top = height * 0.12;
  const bottom = height * 0.8;
  return top + (bottom - top) * Math.min(1, entityY);
}

function depthScale(entityY: number) {
  return 0.45 + 0.85 * Math.min(1, entityY);
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: GameSnapshot,
  world: WorldDef,
  timeSec: number,
  quality: GraphicsQuality,
  playerColor: string,
  skinColor: string,
) {
  ctx.clearRect(0, 0, width, height);

  // --- Parallax sky -------------------------------------------------------
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, world.sky[0]);
  sky.addColorStop(1, world.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Clouds layer (slow)
  if (quality !== "low") {
    ctx.fillStyle = world.clouds;
    const cloudCount = quality === "high" ? 6 : 4;
    for (let i = 0; i < cloudCount; i++) {
      const speed = 6;
      const x = ((i * 137 + timeSec * speed) % (width + 160)) - 80;
      const y = height * (0.08 + (i % 3) * 0.05);
      ctx.beginPath();
      ctx.ellipse(x, y, 42, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Mountains / buildings layer (medium speed)
  ctx.fillStyle = world.mountains;
  const peakCount = 5;
  for (let i = 0; i < peakCount; i++) {
    const speed = 22;
    const spacing = width / 3.2;
    const x = ((i * spacing + timeSec * speed) % (width + spacing)) - spacing / 2;
    const peakHeight = height * (0.18 + (i % 2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - spacing / 2, height * 0.42);
    ctx.lineTo(x, height * 0.42 - peakHeight);
    ctx.lineTo(x + spacing / 2, height * 0.42);
    ctx.closePath();
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = world.ground;
  ctx.fillRect(0, height * 0.42, width, height * 0.58);

  // Lane dividers
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo((width / 3) * i, height * 0.42);
    ctx.lineTo((width / 3) * i, height);
    ctx.stroke();
  }

  // --- Entities (sorted far->near so nearer ones draw on top) ------------
  const drawEmoji = (emoji: string, lane: number, y: number, size: number, extraY = 0) => {
    const cx = laneX(lane, width);
    const cy = depthY(y, height) + extraY;
    const scale = depthScale(y);
    ctx.font = `${Math.round(size * scale)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, cx, cy);
  };

  const sortedObstacles = [...snapshot.obstacles].sort((a, b) => a.y - b.y);
  for (const o of sortedObstacles) {
    drawEmoji(OBSTACLE_EMOJI[o.kind] ?? "⬛", o.lane, o.y, 40);
  }

  for (const e of [...snapshot.enemies].sort((a, b) => a.y - b.y)) {
    drawEmoji(ENEMY_EMOJI[e.kind] ?? "👾", e.lane, e.y, 38);
    if (e.hp && e.maxHp && e.hp < e.maxHp) {
      const cx = laneX(e.lane, width);
      const cy = depthY(e.y, height) - 26 * depthScale(e.y);
      const w = 34 * depthScale(e.y);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(cx - w / 2, cy, w, 4);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(cx - w / 2, cy, w * (e.hp / e.maxHp), 4);
    }
  }

  for (const c of snapshot.coinsOnField) {
    const bob = Math.sin(timeSec * 6 + c.id) * 3;
    drawEmoji("🪙", c.lane, c.y, 26, bob);
  }
  for (const d of snapshot.diamondsOnField) {
    const bob = Math.sin(timeSec * 5 + d.id) * 3;
    drawEmoji("💎", d.lane, d.y, 28, bob);
  }
  for (const p of snapshot.powerupsOnField) {
    drawEmoji(POWERUP_EMOJI[p.kind] ?? "⭐", p.lane, p.y, 30);
  }

  // --- Boss ----------------------------------------------------------------
  if (snapshot.bossActive) {
    const emoji = BOSS_EMOJI[snapshot.bossName] ?? MINI_BOSSES[snapshot.bossName]?.emoji ?? "👹";
    ctx.font = `${Math.round(width * 0.22)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const wobble = Math.sin(timeSec * 3) * 6;
    ctx.fillText(emoji, width / 2, height * 0.2 + wobble);
  }

  // --- Player ---------------------------------------------------------------
  const px = laneX(snapshot.laneVisual, width);
  const groundY = height * 0.78;
  const jumpOffset = snapshot.playerY * height * 0.32;
  const py = groundY + jumpOffset;
  const isSliding = snapshot.playerState === "sliding";
  const isHit = snapshot.playerState === "hit";
  const flashAlpha = isHit ? 0.5 + 0.5 * Math.sin(timeSec * 30) : 1;

  ctx.save();
  ctx.globalAlpha = flashAlpha;
  ctx.translate(px, py);

  const bodyW = 46;
  const bodyH = isSliding ? 26 : 56;

  // glow ring for active invincibility/shield
  const hasInvincible = snapshot.activePowerups.some((p) => p.kind === "invincible");
  const hasShield = snapshot.activePowerups.some((p) => p.kind === "shield");
  if (hasInvincible || hasShield) {
    ctx.beginPath();
    ctx.arc(0, -bodyH / 2, bodyW * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = hasInvincible ? "rgba(250,204,21,0.9)" : "rgba(56,189,248,0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = skinColor !== "#94a3b8" ? skinColor : playerColor;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  const radius = 12;
  roundRect(ctx, -bodyW / 2, -bodyH, bodyW, bodyH, radius);
  ctx.fill();
  ctx.stroke();

  // simple face
  ctx.fillStyle = "rgba(15,23,42,0.85)";
  ctx.beginPath();
  ctx.arc(-8, -bodyH + 16, 3.5, 0, Math.PI * 2);
  ctx.arc(8, -bodyH + 16, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(px, groundY + 6, 22 * (1 - Math.min(0.5, -snapshot.playerY)), 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
