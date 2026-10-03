import { db } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { grantCurrency } from "@/lib/server/wallet";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUserId();
    const { achievementId } = (await req.json()) as { achievementId?: string };
    if (!achievementId) {
      return Response.json({ ok: false, error: "achievementId required" }, { status: 400 });
    }

    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);
    if (!achievement) return Response.json({ ok: false, error: "Unknown achievement" }, { status: 404 });

    const [progress] = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
      .limit(1);

    if (!progress || !progress.completed) {
      return Response.json({ ok: false, error: "Achievement not completed yet" }, { status: 400 });
    }
    if (progress.claimed) {
      return Response.json({ ok: false, error: "Reward already claimed" }, { status: 400 });
    }

    await db
      .update(userAchievements)
      .set({ claimed: true })
      .where(eq(userAchievements.id, progress.id));

    const { user } = await grantCurrency(userId, {
      coins: achievement.rewardCoins,
      diamonds: achievement.rewardDiamonds,
      xp: achievement.rewardXp,
    });

    return Response.json({ ok: true, user });
  } catch (err) {
    console.error("achievement claim error", err);
    return Response.json({ ok: false, error: "Failed to claim achievement" }, { status: 500 });
  }
}
