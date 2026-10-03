import { db } from "@/db";
import { dailyRewards, inventory, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getOrCreateUserId } from "@/lib/session";
import { computeDailyRewardStatus } from "@/lib/server/dailyRewardStatus";
import { grantCurrency } from "@/lib/server/wallet";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const userId = await getOrCreateUserId();
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    const status = computeDailyRewardStatus({
      lastDailyRewardDay: user.lastDailyRewardDay,
      lastDailyRewardAt: user.lastDailyRewardAt,
    });

    if (!status.claimable) {
      return Response.json({ ok: false, error: "Come back later for your next reward" }, { status: 400 });
    }

    const [reward] = await db
      .select()
      .from(dailyRewards)
      .where(eq(dailyRewards.dayIndex, status.nextDay))
      .limit(1);
    if (!reward) return Response.json({ ok: false, error: "Reward not configured" }, { status: 500 });

    const now = new Date();
    await db
      .update(users)
      .set({ lastDailyRewardDay: status.nextDay, lastDailyRewardAt: now })
      .where(eq(users.id, userId));

    if (reward.rewardType === "coins") {
      await grantCurrency(userId, { coins: reward.rewardAmount });
    } else if (reward.rewardType === "diamonds") {
      await grantCurrency(userId, { diamonds: reward.rewardAmount });
    } else if (reward.rewardType === "powerup" && reward.rewardItemKey) {
      const existing = await db
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.userId, userId),
            eq(inventory.itemType, "powerup"),
            eq(inventory.itemKey, reward.rewardItemKey),
          ),
        )
        .limit(1);
      if (existing.length === 0) {
        await db.insert(inventory).values({
          id: randomUUID(),
          userId,
          itemType: "powerup",
          itemKey: reward.rewardItemKey,
          level: reward.rewardAmount,
          owned: true,
          equipped: false,
        });
      } else {
        await db
          .update(inventory)
          .set({ level: existing[0].level + reward.rewardAmount })
          .where(eq(inventory.id, existing[0].id));
      }
    } else if (reward.rewardType === "skin" && reward.rewardItemKey) {
      const existing = await db
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.userId, userId),
            eq(inventory.itemType, "skin"),
            eq(inventory.itemKey, reward.rewardItemKey),
          ),
        )
        .limit(1);
      if (existing.length === 0) {
        await db.insert(inventory).values({
          id: randomUUID(),
          userId,
          itemType: "skin",
          itemKey: reward.rewardItemKey,
          owned: true,
          equipped: false,
        });
      } else {
        await db.update(inventory).set({ owned: true }).where(eq(inventory.id, existing[0].id));
      }
    }

    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return Response.json({ ok: true, reward, user: updatedUser });
  } catch (err) {
    console.error("daily reward claim error", err);
    return Response.json({ ok: false, error: "Failed to claim reward" }, { status: 500 });
  }
}
