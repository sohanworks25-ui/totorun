// =============================================================================
// SESSION / ACCOUNT BOOTSTRAP
// =============================================================================
// This project uses a lightweight anonymous-account model suitable for a demo
// backend: each browser/device gets a persistent `uid` cookie which maps 1:1
// to a `users` row. In a production rollout this is where you would plug in
// real authentication (Google Play Games Services sign-in, email, etc.) —
// everything downstream (wallet, inventory, purchases) already keys off a
// stable `userId`, so swapping the identity provider does not require
// touching the economy/progression code.
// =============================================================================

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "runner_uid";

export async function getOrCreateUserId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;

  if (existing) {
    const rows = await db.select().from(users).where(eq(users.id, existing)).limit(1);
    if (rows.length > 0) return existing;
  }

  const id = randomUUID();
  const username = `Runner${Math.floor(1000 + Math.random() * 9000)}`;

  await db.insert(users).values({
    id,
    username,
  });

  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return id;
}
