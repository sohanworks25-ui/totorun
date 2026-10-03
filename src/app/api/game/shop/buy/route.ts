import { db } from "@/db";
import { shopItems, inventory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { spendCurrency, InsufficientFundsError } from "@/lib/server/wallet";

export const dynamic = "force-dynamic";

const POWERUP_CHARGES_PER_PACK = 5;

export async function POST(req: Request) {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const { shopItemId } = (await req.json()) as { shopItemId?: string };
    if (!shopItemId) return Response.json({ ok: false, error: "shopItemId required" }, { status: 400 });

    const [item] = await db.select().from(shopItems).where(eq(shopItems.id, shopItemId)).limit(1);
    if (!item || !item.active) {
      return Response.json({ ok: false, error: "Item not available" }, { status: 404 });
    }

    if (item.limitedTimeEnd && item.limitedTimeEnd.getTime() < Date.now()) {
      return Response.json({ ok: false, error: "This offer has expired" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.userId, userId),
          eq(inventory.itemType, item.refItemType),
          eq(inventory.itemKey, item.refItemId),
        ),
      )
      .limit(1);

    const isUpgrade = item.refItemType === "upgrade";
    const isPowerup = item.refItemType === "powerup";
    const currentLevel = existing[0]?.level ?? 0;

    if (!isUpgrade && !isPowerup && existing.length > 0 && existing[0].owned) {
      return Response.json({ ok: false, error: "Already owned" }, { status: 400 });
    }

    const price = isUpgrade ? item.price * (currentLevel + 1) : item.price;

    let user;
    try {
      user = await spendCurrency(userId, item.currency as "coins" | "diamonds", price);
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        return Response.json({ ok: false, error: `Not enough ${item.currency}` }, { status: 400 });
      }
      throw err;
    }

    if (existing.length === 0) {
      await db.insert(inventory).values({
        id: randomUUID(),
        userId,
        itemType: item.refItemType,
        itemKey: item.refItemId,
        level: isUpgrade ? 1 : isPowerup ? POWERUP_CHARGES_PER_PACK : 1,
        owned: true,
        equipped: false,
      });
    } else {
      await db
        .update(inventory)
        .set({
          owned: true,
          level: isUpgrade
            ? currentLevel + 1
            : isPowerup
              ? currentLevel + POWERUP_CHARGES_PER_PACK
              : currentLevel,
        })
        .where(eq(inventory.id, existing[0].id));
    }

    return Response.json({ ok: true, coins: user.coins, diamonds: user.diamonds });
  } catch (err) {
    console.error("shop buy error", err);
    return Response.json({ ok: false, error: "Purchase failed" }, { status: 500 });
  }
}
