import { db } from "@/db";
import { inventory, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUserId();
    const { itemType, itemKey } = (await req.json()) as {
      itemType?: string;
      itemKey?: string;
    };

    if (!itemType || !itemKey) {
      return Response.json({ ok: false, error: "itemType and itemKey required" }, { status: 400 });
    }

    const owned = await db
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

    if (owned.length === 0 || !owned[0].owned) {
      return Response.json({ ok: false, error: "Item not owned" }, { status: 400 });
    }

    // Unequip every other item of this type, equip the chosen one.
    await db
      .update(inventory)
      .set({ equipped: false })
      .where(and(eq(inventory.userId, userId), eq(inventory.itemType, itemType)));

    await db.update(inventory).set({ equipped: true }).where(eq(inventory.id, owned[0].id));

    if (itemType === "character") {
      await db.update(users).set({ selectedCharacter: itemKey }).where(eq(users.id, userId));
    } else if (itemType === "skin") {
      await db.update(users).set({ selectedSkin: itemKey }).where(eq(users.id, userId));
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("equip error", err);
    return Response.json({ ok: false, error: "Failed to equip item" }, { status: 500 });
  }
}
