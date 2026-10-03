// =============================================================================
// PURCHASE VERIFICATION — server-authoritative Google Play Billing ledger.
// =============================================================================
// PRODUCTION FLOW (how this module is meant to be wired on a real backend):
//
//   1. Android app (Flet UI -> Android Billing bridge) opens the Google Play
//      Billing purchase flow for a `productId` (e.g. "diamond_pack_300").
//   2. Google Play returns a signed Purchase object containing a
//      `purchaseToken` + `orderId` to the Android bridge.
//   3. The Android bridge hands {productId, purchaseToken, orderId} to the
//      Flet app, which forwards it to THIS backend (never trusting the
//      client to just say "payment succeeded").
//   4. This backend calls the Google Play Developer API
//      (`purchases.products.get` using a service-account JSON key that lives
//      ONLY on the server, never inside the app) to confirm the purchase is
//      real, unconsumed, and in the "purchased" state.
//   5. Only after that server-side confirmation do we grant currency and
//      acknowledge/consume the purchase via the Developer API.
//
// This sandbox environment has no real Android client and no Play Console
// credentials, so `verifyWithGooglePlay` below is a clearly-labeled stand-in
// that performs the same *shape* of validation (token format, product
// existence) without contacting Google. Swap its body for a real call to
// `androidpublisher.purchases.products.get` when you have service-account
// credentials — nothing else in the purchase pipeline needs to change,
// because the uniqueness/anti-replay guarantees come from the database
// constraint on `purchases.google_purchase_token`, not from this function.
// =============================================================================

import { db } from "@/db";
import { products, purchases, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { grantCurrency } from "@/lib/server/wallet";

export interface PurchasePayload {
  productId: string;
  purchaseToken: string;
  orderId: string;
}

export type PurchaseResult =
  | { status: "granted"; coins: number; diamonds: number }
  | { status: "already_processed"; coins: number; diamonds: number }
  | { status: "invalid_product" }
  | { status: "verification_failed" };

/**
 * Stand-in for a real Google Play Developer API call. Replace the body with:
 *
 *   const androidpublisher = google.androidpublisher({ version: "v3", auth });
 *   const res = await androidpublisher.purchases.products.get({
 *     packageName: "com.sohan.runner",
 *     productId,
 *     token: purchaseToken,
 *   });
 *   return res.data.purchaseState === 0; // 0 = purchased
 *
 * using a service account key stored in a server-only env var
 * (GOOGLE_PLAY_SERVICE_ACCOUNT_JSON), never shipped with the app.
 */
async function verifyWithGooglePlay(payload: PurchasePayload): Promise<boolean> {
  const tokenLooksValid = payload.purchaseToken.length >= 8;
  const orderLooksValid = payload.orderId.length >= 3;
  return tokenLooksValid && orderLooksValid;
}

export async function processPurchase(
  userId: string,
  payload: PurchasePayload,
): Promise<PurchaseResult> {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, payload.productId))
    .limit(1);

  if (!product) return { status: "invalid_product" };

  // Anti-replay: the purchase token is UNIQUE in the DB. If we've already
  // recorded it, never grant currency again — just report the prior result.
  const existing = await db
    .select()
    .from(purchases)
    .where(eq(purchases.googlePurchaseToken, payload.purchaseToken))
    .limit(1);

  if (existing.length > 0) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return {
      status: "already_processed",
      coins: user?.coins ?? 0,
      diamonds: user?.diamonds ?? 0,
    };
  }

  const verified = await verifyWithGooglePlay(payload);
  if (!verified) return { status: "verification_failed" };

  const totalAmount = product.amount + product.bonus;
  const grant =
    product.type === "coins" ? { coins: totalAmount } : { diamonds: totalAmount };

  try {
    await db.insert(purchases).values({
      id: randomUUID(),
      userId,
      productId: product.id,
      googlePurchaseToken: payload.purchaseToken,
      orderId: payload.orderId,
      purchaseState: "purchased",
      quantity: 1,
      currencyGranted: totalAmount,
      purchaseTime: new Date(),
      processedAt: new Date(),
    });
  } catch {
    // Unique constraint violation = a concurrent request already recorded
    // this token. Treat as already processed to avoid double-granting.
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return {
      status: "already_processed",
      coins: user?.coins ?? 0,
      diamonds: user?.diamonds ?? 0,
    };
  }

  const { user } = await grantCurrency(userId, grant);
  return { status: "granted", coins: user.coins, diamonds: user.diamonds };
}
