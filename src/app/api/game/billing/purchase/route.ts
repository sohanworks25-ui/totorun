import { getOrCreateUserId } from "@/lib/session";
import { processPurchase } from "@/lib/monetization/purchaseVerification";

export const dynamic = "force-dynamic";

// This endpoint is the server side of the Google Play Billing pipeline:
//   Android Billing Library -> Flet/Android bridge -> THIS endpoint
//     -> Google Play Developer API verification -> grant currency.
// See src/lib/monetization/purchaseVerification.ts for the full flow
// documentation and exactly what to change for a real Play Console app.
export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUserId();
    const body = (await req.json()) as {
      productId?: string;
      purchaseToken?: string;
      orderId?: string;
    };

    if (!body.productId || !body.purchaseToken || !body.orderId) {
      return Response.json(
        { ok: false, error: "productId, purchaseToken and orderId are required" },
        { status: 400 },
      );
    }

    const result = await processPurchase(userId, {
      productId: body.productId,
      purchaseToken: body.purchaseToken,
      orderId: body.orderId,
    });

    if (result.status === "invalid_product") {
      return Response.json({ ok: false, error: "Unknown product" }, { status: 404 });
    }
    if (result.status === "verification_failed") {
      return Response.json({ ok: false, error: "Purchase could not be verified" }, { status: 400 });
    }

    return Response.json({ ok: true, status: result.status, coins: result.coins, diamonds: result.diamonds });
  } catch (err) {
    console.error("billing purchase error", err);
    return Response.json({ ok: false, error: "Purchase processing failed" }, { status: 500 });
  }
}
