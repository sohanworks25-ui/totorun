import { db } from "@/db";
import { shopItems, inventory, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();

    const items = await db.select().from(shopItems).where(eq(shopItems.active, true));
    const owned = await db.select().from(inventory).where(eq(inventory.userId, userId));
    const iapProducts = await db.select().from(products);

    const ownedMap = new Map(
      owned.map((o) => [`${o.itemType}:${o.itemKey}`, o]),
    );

    const now = Date.now();
    const visible = items.filter((item) => {
      const key = `${item.refItemType}:${item.refItemId}`;
      const isOwned = ownedMap.get(key)?.owned ?? false;
      if (!item.limitedTimeEnd) return true;
      const expired = item.limitedTimeEnd.getTime() < now;
      return !expired || isOwned; // keep permanently for owners after expiry
    });

    const enriched = visible.map((item) => {
      const key = `${item.refItemType}:${item.refItemId}`;
      const inv = ownedMap.get(key);
      const isUpgrade = item.refItemType === "upgrade";
      const isPowerup = item.refItemType === "powerup";
      const level = inv?.level ?? 0;
      const price = isUpgrade ? item.price * (level + 1) : item.price;

      return {
        ...item,
        owned: isUpgrade || isPowerup ? false : inv?.owned ?? false,
        equipped: inv?.equipped ?? false,
        level,
        currentPrice: price,
        msRemaining: item.limitedTimeEnd ? Math.max(0, item.limitedTimeEnd.getTime() - now) : null,
      };
    });

    return Response.json({ ok: true, items: enriched, products: iapProducts });
  } catch (err) {
    console.error("shop error", err);
    return Response.json({ ok: false, error: "Failed to load shop" }, { status: 500 });
  }
}
