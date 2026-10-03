import { db } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const all = await db.select().from(achievements);

    const result = [];
    for (const a of all) {
      const [progress] = await db
        .select()
        .from(userAchievements)
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, a.id)))
        .limit(1);
      result.push({
        ...a,
        progress: progress?.progress ?? 0,
        completed: progress?.completed ?? false,
        claimed: progress?.claimed ?? false,
      });
    }

    return Response.json({ ok: true, achievements: result });
  } catch (err) {
    console.error("achievements error", err);
    return Response.json({ ok: false, error: "Failed to load achievements" }, { status: 500 });
  }
}
