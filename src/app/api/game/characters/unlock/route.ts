import { db } from "@/db";
import { characters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { unlockOneTimeItem } from "@/lib/server/unlock";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const { characterId } = (await req.json()) as { characterId?: string };
    if (!characterId) {
      return Response.json({ ok: false, error: "characterId required" }, { status: 400 });
    }

    const [def] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
    if (!def) return Response.json({ ok: false, error: "Unknown character" }, { status: 404 });

    const result = await unlockOneTimeItem(
      userId,
      "character",
      characterId,
      def.unlockPrice,
      def.unlockCurrency as "coins" | "diamonds",
    );

    return Response.json({ ok: true, result });
  } catch (err) {
    console.error("unlock character error", err);
    return Response.json({ ok: false, error: "Failed to unlock character" }, { status: 500 });
  }
}
