import { db } from "@/db";
import { skins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { unlockOneTimeItem } from "@/lib/server/unlock";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const { skinId } = (await req.json()) as { skinId?: string };
    if (!skinId) return Response.json({ ok: false, error: "skinId required" }, { status: 400 });

    const [def] = await db.select().from(skins).where(eq(skins.id, skinId)).limit(1);
    if (!def) return Response.json({ ok: false, error: "Unknown skin" }, { status: 404 });

    const result = await unlockOneTimeItem(
      userId,
      "skin",
      skinId,
      def.price,
      def.currency as "coins" | "diamonds",
    );

    return Response.json({ ok: true, result });
  } catch (err) {
    console.error("unlock skin error", err);
    return Response.json({ ok: false, error: "Failed to unlock skin" }, { status: 500 });
  }
}
