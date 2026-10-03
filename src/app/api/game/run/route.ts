import { db } from "@/db";
import { leaderboardEntries, runs, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { grantCurrency } from "@/lib/server/wallet";
import { updateAchievementProgress, updateMissionProgress } from "@/lib/server/progression";
import { worldForDistance } from "@/lib/data/worlds";

export const dynamic = "force-dynamic";

interface RunBody {
  score: number;
  distance: number;
  coinsCollected: number;
  diamondsCollected: number;
  jumps: number;
  powerupsUsed: number;
  bossesDefeated: number;
}

// Basic anti-cheat sanity clamps — a real production backend would track
// elapsed wall-clock time per run and reject physically impossible stats.
const MAX_DISTANCE_PER_RUN = 50000; // meters
const MAX_COINS_PER_RUN = 20000;
const MAX_DIAMONDS_PER_RUN = 500;
const MAX_SCORE_PER_RUN = 2_000_000;

function clamp(n: unknown, max: number): number {
  const v = Math.floor(Number(n) || 0);
  return Math.max(0, Math.min(v, max));
}

export async function POST(req: Request) {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const body = (await req.json()) as Partial<RunBody>;

    const distance = clamp(body.distance, MAX_DISTANCE_PER_RUN);
    const coinsCollected = clamp(body.coinsCollected, MAX_COINS_PER_RUN);
    const diamondsCollected = clamp(body.diamondsCollected, MAX_DIAMONDS_PER_RUN);
    const jumps = clamp(body.jumps, 5000);
    const powerupsUsed = clamp(body.powerupsUsed, 200);
    const bossesDefeated = clamp(body.bossesDefeated, 20);
    const score = clamp(body.score, MAX_SCORE_PER_RUN);

    const xpGained = Math.round(distance * 0.1 + coinsCollected * 0.2 + diamondsCollected * 2 + bossesDefeated * 150);
    const world = worldForDistance(distance);

    await db.insert(runs).values({
      id: randomUUID(),
      userId,
      score,
      distance,
      coinsCollected,
      diamondsCollected,
      xpGained,
      jumps,
      powerupsUsed,
      bossesDefeated,
      worldId: world.id,
    });

    const [prevUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const isNewHighScore = score > (prevUser?.highestScore ?? 0);

    await db
      .update(users)
      .set({
        totalDistance: sql`${users.totalDistance} + ${distance}`,
        totalJumps: sql`${users.totalJumps} + ${jumps}`,
        totalPowerupsUsed: sql`${users.totalPowerupsUsed} + ${powerupsUsed}`,
        bossesDefeated: sql`${users.bossesDefeated} + ${bossesDefeated}`,
        runsCompleted: sql`${users.runsCompleted} + 1`,
        highestScore: isNewHighScore ? score : prevUser?.highestScore ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    const { user, levelsGained } = await grantCurrency(userId, {
      coins: coinsCollected,
      diamonds: diamondsCollected,
      xp: xpGained,
    });

    if (score > 0) {
      await db.insert(leaderboardEntries).values({
        id: randomUUID(),
        userId,
        username: user.username,
        score,
        distance,
        worldId: world.id,
      });
    }

    const completedMissions = await updateMissionProgress(userId, {
      distance,
      coinsCollected,
      diamondsCollected,
      jumps,
      powerupsUsed,
      bossesDefeated,
    });
    const completedAchievements = await updateAchievementProgress(userId);

    return Response.json({
      ok: true,
      user,
      levelsGained,
      isNewHighScore,
      xpGained,
      completedMissions,
      completedAchievements,
      world: world.id,
    });
  } catch (err) {
    console.error("run submit error", err);
    return Response.json({ ok: false, error: "Failed to submit run" }, { status: 500 });
  }
}
