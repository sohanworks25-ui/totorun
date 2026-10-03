import { db } from "@/db";
import { purchases } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOrCreateUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// Restoring purchases: in production this calls the Billing Library's
// `queryPurchasesAsync` to re-fetch active entitlements from Google Play,
// then re-runs each through the same verification pipeline (which is
// idempotent thanks to the unique purchase-token constraint). Here we simply
// return the user's transaction history recorded by our own ledger.
export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    const history = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));

    return Response.json({ ok: true, purchases: history });
  } catch (err) {
    console.error("restore purchases error", err);
    return Response.json({ ok: false, error: "Failed to restore purchases" }, { status: 500 });
  }
}
