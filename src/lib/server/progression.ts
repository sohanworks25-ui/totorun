// =============================================================================
// PROGRESSION — mission & achievement progress tracking.
// Called once per submitted run (server-side) so progress can never be
// spoofed by the client beyond the run stats it reports (which are
// themselves sanity-clamped in the /api/game/run route).
// =============================================================================

import { db } from "@/db";
import {
  missions,
  userMissionProgress,
  achievements,
  userAchievements,
  users,
  inventory,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { CHARACTERS } from "@/lib/data/characters";
import { SKINS } from "@/lib/data/skins";

export interface RunStats {
  distance: number;
  coinsCollected: number;
  diamondsCollected: number;
  jumps: number;
  powerupsUsed: number;
  bossesDefeated: number;
}

function dailyPeriodKey(d = new Date()): string {
  return `D-${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function weeklyPeriodKey(d = new Date()): string {
  const firstJan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const days = Math.floor((d.getTime() - firstJan.getTime()) / 86400000);
  const week = Math.ceil((days + firstJan.getUTCDay() + 1) / 7);
  return `W-${d.getUTCFullYear()}-${week}`;
}

function metricValue(metric: string, stats: RunStats): number {
  switch (metric) {
    case "distance":
      return stats.distance;
    case "coins":
      return stats.coinsCollected;
    case "diamonds":
      return stats.diamondsCollected;
    case "jumps":
      return stats.jumps;
    case "powerups":
      return stats.powerupsUsed;
    case "bosses":
      return stats.bossesDefeated;
    case "runs":
      return 1;
    default:
      return 0;
  }
}

/** Updates progress for every active mission based on this run's stats. */
export async function updateMissionProgress(userId: string, stats: RunStats) {
  const allMissions = await db.select().from(missions);
  const now = new Date();
  const dailyKey = dailyPeriodKey(now);
  const weeklyKey = weeklyPeriodKey(now);
  const newlyCompleted: string[] = [];

  for (const mission of allMissions) {
    const delta = metricValue(mission.metric, stats);
    if (delta <= 0) continue;

    const periodKey = mission.type === "daily" ? dailyKey : weeklyKey;

    const existing = await db
      .select()
      .from(userMissionProgress)
      .where(
        and(
          eq(userMissionProgress.userId, userId),
          eq(userMissionProgress.missionId, mission.id),
          eq(userMissionProgress.periodKey, periodKey),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      const progress = Math.min(delta, mission.target);
      await db.insert(userMissionProgress).values({
        id: randomUUID(),
        userId,
        missionId: mission.id,
        periodKey,
        progress,
        completed: progress >= mission.target,
        claimed: false,
      });
      if (progress >= mission.target) newlyCompleted.push(mission.id);
    } else {
      const row = existing[0];
      if (row.completed) continue;
      const progress = Math.min(row.progress + delta, mission.target);
      const completed = progress >= mission.target;
      await db
        .update(userMissionProgress)
        .set({ progress, completed, updatedAt: new Date() })
        .where(eq(userMissionProgress.id, row.id));
      if (completed) newlyCompleted.push(mission.id);
    }
  }

  return newlyCompleted;
}

/** Updates progress for all lifetime achievements based on fresh user totals. */
export async function updateAchievementProgress(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return [];

  const ownedItems = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.userId, userId), eq(inventory.owned, true)));

  const highRarities = new Set(["LEGENDARY", "MYTHIC"]);
  const legendaryOwned = ownedItems.filter((i) => {
    if (i.itemType === "character") {
      const def = CHARACTERS.find((c) => c.id === i.itemKey);
      return def ? highRarities.has(def.rarity) : false;
    }
    if (i.itemType === "skin") {
      const def = SKINS.find((s) => s.id === i.itemKey);
      return def ? highRarities.has(def.rarity) : false;
    }
    return false;
  }).length;

  const skinsOwned = ownedItems.filter((i) => i.itemType === "skin").length;

  const allAchievements = await db.select().from(achievements);
  const newlyCompleted: string[] = [];

  const metricValues: Record<string, number> = {
    runs: user.runsCompleted,
    coinsLifetime: user.lifetimeCoins,
    diamondsLifetime: user.lifetimeDiamonds,
    distanceLifetime: user.totalDistance,
    bosses: user.bossesDefeated,
    legendaryOwned,
    skinsOwned,
    coinsLifetimeMillion: user.lifetimeCoins,
  };

  for (const ach of allAchievements) {
    const value = metricValues[ach.metric] ?? 0;

    const existing = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, ach.id)))
      .limit(1);

    const progress = Math.min(value, ach.target);
    const completed = value >= ach.target;

    if (existing.length === 0) {
      await db.insert(userAchievements).values({
        id: randomUUID(),
        userId,
        achievementId: ach.id,
        progress,
        completed,
        claimed: false,
        completedAt: completed ? new Date() : null,
      });
      if (completed) newlyCompleted.push(ach.id);
    } else if (!existing[0].completed) {
      await db
        .update(userAchievements)
        .set({ progress, completed, completedAt: completed ? new Date() : null })
        .where(eq(userAchievements.id, existing[0].id));
      if (completed) newlyCompleted.push(ach.id);
    }
  }

  return newlyCompleted;
}

export async function getMissionIdsByType(type: "daily" | "weekly") {
  const rows = await db.select().from(missions).where(eq(missions.type, type));
  return rows.map((r) => r.id);
}
