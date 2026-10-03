import { db } from "@/db";
import { missions, userMissionProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";
import { grantCurrency } from "@/lib/server/wallet";

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

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUserId();
    const { missionId } = (await req.json()) as { missionId?: string };
    if (!missionId) return Response.json({ ok: false, error: "missionId required" }, { status: 400 });

    const [mission] = await db.select().from(missions).where(eq(missions.id, missionId)).limit(1);
    if (!mission) return Response.json({ ok: false, error: "Unknown mission" }, { status: 404 });

    const periodKey = mission.type === "daily" ? dailyPeriodKey() : weeklyPeriodKey();
    const [progress] = await db
      .select()
      .from(userMissionProgress)
      .where(
        and(
          eq(userMissionProgress.userId, userId),
          eq(userMissionProgress.missionId, missionId),
          eq(userMissionProgress.periodKey, periodKey),
        ),
      )
      .limit(1);

    if (!progress || !progress.completed) {
      return Response.json({ ok: false, error: "Mission not completed yet" }, { status: 400 });
    }
    if (progress.claimed) {
      return Response.json({ ok: false, error: "Reward already claimed" }, { status: 400 });
    }

    await db
      .update(userMissionProgress)
      .set({ claimed: true })
      .where(eq(userMissionProgress.id, progress.id));

    const { user } = await grantCurrency(userId, {
      coins: mission.rewardCoins,
      diamonds: mission.rewardDiamonds,
      xp: mission.rewardXp,
    });

    return Response.json({ ok: true, user });
  } catch (err) {
    console.error("mission claim error", err);
    return Response.json({ ok: false, error: "Failed to claim mission" }, { status: 500 });
  }
}
