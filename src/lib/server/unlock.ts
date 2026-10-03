import { db } from "@/db";
import { inventory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { spendCurrency, InsufficientFundsError } from "@/lib/server/wallet";

export type UnlockResult =
  | { status: "ok"; coins: number; diamonds: number }
  | { status: "already_owned" }
  | { status: "insufficient_funds" };

/** One-time purchase (characters, skins, trails, effects) with no scaling price. */
export async function unlockOneTimeItem(
  userId: string,
  itemType: string,
  itemKey: string,
  price: number,
  currency: "coins" | "diamonds",
): Promise<UnlockResult> {
  const existing = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.itemType, itemType),
        eq(inventory.itemKey, itemKey),
      ),
    )
    .limit(1);

  if (existing.length > 0 && existing[0].owned) {
    return { status: "already_owned" };
  }

  if (price > 0) {
    try {
      const user = await spendCurrency(userId, currency, price);
      await grantInventory(userId, itemType, itemKey);
      return { status: "ok", coins: user.coins, diamonds: user.diamonds };
    } catch (err) {
      if (err instanceof InsufficientFundsError) return { status: "insufficient_funds" };
      throw err;
    }
  }

  // Free item
  await grantInventory(userId, itemType, itemKey);
  return { status: "ok", coins: 0, diamonds: 0 };
}

async function grantInventory(userId: string, itemType: string, itemKey: string) {
  const existing = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.userId, userId),
        eq(inventory.itemType, itemType),
        eq(inventory.itemKey, itemKey),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(inventory).values({
      id: randomUUID(),
      userId,
      itemType,
      itemKey,
      owned: true,
      equipped: false,
    });
  } else {
    await db.update(inventory).set({ owned: true }).where(eq(inventory.id, existing[0].id));
  }
}
