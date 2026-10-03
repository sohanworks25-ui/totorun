import { db } from "@/db";
import { leaderboardEntries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    const top = await db
      .select()
      .from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.score))
      .limit(20);

    return Response.json({ ok: true, entries: top, currentUserId: userId });
  } catch (err) {
    console.error("leaderboard error", err);
    return Response.json({ ok: false, error: "Failed to load leaderboard" }, { status: 500 });
  }
}
