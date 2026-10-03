// =============================================================================
// BILLING CLIENT — Android Google Play Billing bridge (client side).
// =============================================================================
// REAL ANDROID ARCHITECTURE (how this module is wired on a native build):
//
//   Flet UI (Python)
//     -> calls a small Android platform channel / plugin, e.g. a Kotlin
//        `BillingBridge` class wrapping Google's Play Billing Library:
//
//          class BillingBridge(activity: Activity) {
//              private val client = BillingClient.newBuilder(activity)
//                  .setListener(purchasesUpdatedListener)
//                  .enablePendingPurchases()
//                  .build()
//
//              fun launchPurchase(productId: String) { ... client.launchBillingFlow(...) }
//          }
//
//     -> The bridge is exposed to Flet via a platform channel (MethodChannel
//        style, same pattern used by `flet_core`'s Android embedding) so
//        Python can call `billing_bridge.launch_purchase("diamond_pack_300")`
//        and receive an async result event containing
//        { productId, purchaseToken, orderId }.
//     -> Python forwards that payload, unmodified, to this backend's
//        POST /api/game/billing/purchase endpoint for verification + grant.
//     -> Only the backend's response (granted coins/diamonds) is trusted to
//        update the UI wallet display.
//
// WEB SANDBOX (this project): there is no Android billing library available
// in this browser-based build/preview, so `launchPurchase` below simulates
// the bridge by generating a purchase token locally and sending it straight
// to the same backend verification endpoint used by the real app. This lets
// the full "client -> backend -> ledger -> grant" pipeline be exercised
// end-to-end without inventing a fake "grant currency" client API.
// =============================================================================

import { api } from "@/lib/client/api";

export async function launchPurchase(productId: string) {
  // In production this value comes from Google Play after a real payment.
  const purchaseToken = `sandbox-${productId}-${crypto.randomUUID()}`;
  const orderId = `order-${crypto.randomUUID()}`;
  return api.purchase(productId, purchaseToken, orderId);
}
