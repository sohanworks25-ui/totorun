import { db } from "@/db";
import { missions, userMissionProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";

export const dynamic = "force-dynamic";

function dailyPeriodKey(d = new Date()): string {
  return `D-${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}
function weeklyPeriodKey(d = new Date()): string {
  const firstJan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const days = Math.floor((d.getTime() - firstJan.getTime()) / 86400000);
  const week = Math.ceil((days + firstJan.getUTCDay() + 1) / 7);
  return `W-${d.getUTCFullYear()}-${week}`;
}

export async function GET() {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const all = await db.select().from(missions);
    const dailyKey = dailyPeriodKey();
    const weeklyKey = weeklyPeriodKey();

    const result = [];
    for (const m of all) {
      const periodKey = m.type === "daily" ? dailyKey : weeklyKey;
      const rows = await db
        .select()
        .from(userMissionProgress)
        .where(
          and(
            eq(userMissionProgress.userId, userId),
            eq(userMissionProgress.missionId, m.id),
            eq(userMissionProgress.periodKey, periodKey),
          ),
        )
        .limit(1);
      const progress = rows[0];
      result.push({
        ...m,
        progress: progress?.progress ?? 0,
        completed: progress?.completed ?? false,
        claimed: progress?.claimed ?? false,
      });
    }

    return Response.json({ ok: true, missions: result });
  } catch (err) {
    console.error("missions error", err);
    return Response.json({ ok: false, error: "Failed to load missions" }, { status: 500 });
  }
}
