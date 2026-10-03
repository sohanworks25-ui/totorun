import { getOrCreateUserId } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/server/catalogSeed";
import { getFullProfile } from "@/lib/server/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureCatalogSeeded();
    const userId = await getOrCreateUserId();
    const profile = await getFullProfile(userId);
    return Response.json({ ok: true, ...profile });
  } catch (err) {
    console.error("profile error", err);
    return Response.json({ ok: false, error: "Failed to load profile" }, { status: 500 });
  }
}
