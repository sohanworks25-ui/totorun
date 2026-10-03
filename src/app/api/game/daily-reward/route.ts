import { db } from "@/db";
import { dailyRewards, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { computeDailyRewardStatus } from "@/lib/server/dailyRewardStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const rewards = await db.select().from(dailyRewards);

    const status = computeDailyRewardStatus({
      lastDailyRewardDay: user.lastDailyRewardDay,
      lastDailyRewardAt: user.lastDailyRewardAt,
    });

    return Response.json({
      ok: true,
      rewards: rewards.sort((a, b) => a.dayIndex - b.dayIndex),
      status,
      lastDailyRewardDay: user.lastDailyRewardDay,
    });
  } catch (err) {
    console.error("daily reward status error", err);
    return Response.json({ ok: false, error: "Failed to load daily reward" }, { status: 500 });
  }
}
