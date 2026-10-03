import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";

export const dynamic = "force-dynamic";

// In production, the Android app asks the Google Play Billing Library for
// localized prices (`ProductDetails.oneTimePurchaseOfferDetails.formattedPrice`)
// for each of these product IDs and merges them client-side. This endpoint
// only returns the catalog of what Diamonds/Coins each product grants — it
// deliberately never hard-codes a real-money price.
export async function GET() {
  try {
    await ensureCatalogSeeded();
    const all = await db.select().from(products);
    return Response.json({ ok: true, products: all });
  } catch (err) {
    console.error("billing products error", err);
    return Response.json({ ok: false, error: "Failed to load products" }, { status: 500 });
  }
}
