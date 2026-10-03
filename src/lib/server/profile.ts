import { db } from "@/db";
import { inventory, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/** Ensures a brand-new account owns the default free character + skin. */
export async function ensureStarterInventory(userId: string) {
  for (const [itemType, itemKey] of [
    ["character", "runner"],
    ["skin", "default"],
  ] as const) {
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
        equipped: true,
      });
    }
  }
}

export async function getFullProfile(userId: string) {
  await ensureStarterInventory(userId);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const items = await db.select().from(inventory).where(eq(inventory.userId, userId));

  return { user, inventory: items };
}
