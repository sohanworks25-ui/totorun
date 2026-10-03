import { db } from "@/db";
import { skins, inventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { ensureStarterInventory } from "@/lib/server/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    await ensureStarterInventory(userId);

    const all = await db.select().from(skins);
    const owned = await db.select().from(inventory).where(eq(inventory.userId, userId));
    const ownedSet = new Set(owned.filter((i) => i.itemType === "skin").map((i) => i.itemKey));
    const equipped = owned.find((i) => i.itemType === "skin" && i.equipped)?.itemKey ?? "default";

    return Response.json({
      ok: true,
      skins: all.map((s) => ({ ...s, owned: ownedSet.has(s.id), equipped: s.id === equipped })),
    });
  } catch (err) {
    console.error("skins error", err);
    return Response.json({ ok: false, error: "Failed to load skins" }, { status: 500 });
  }
}
