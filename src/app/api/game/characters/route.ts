import { db } from "@/db";
import { characters, inventory } from "@/db/schema";
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

    const all = await db.select().from(characters);
    const owned = await db
      .select()
      .from(inventory)
      .where(eq(inventory.userId, userId));

    const ownedSet = new Set(
      owned.filter((i) => i.itemType === "character").map((i) => i.itemKey),
    );
    const equipped = owned.find((i) => i.itemType === "character" && i.equipped)?.itemKey ?? "runner";

    return Response.json({
      ok: true,
      characters: all.map((c) => ({ ...c, owned: ownedSet.has(c.id), equipped: c.id === equipped })),
    });
  } catch (err) {
    console.error("characters error", err);
    return Response.json({ ok: false, error: "Failed to load characters" }, { status: 500 });
  }
}
