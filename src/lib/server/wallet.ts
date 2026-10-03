// =============================================================================
// WALLET — the ONLY place that mutates a user's coins/diamonds/xp/level.
// The client never sets these values directly; it only triggers actions
// (finish a run, buy an item, claim a reward) that call into this module.
// =============================================================================

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { applyXpGain } from "@/lib/economy/levels";

export class InsufficientFundsError extends Error {
  constructor(currency: string) {
    super(`Not enough ${currency}`);
    this.name = "InsufficientFundsError";
  }
}

export async function getUser(userId: string) {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (rows.length === 0) throw new Error("User not found");
  return rows[0];
}

/** Grants coins/diamonds/xp (and resolves level-ups). Safe for positive amounts only. */
export async function grantCurrency(
  userId: string,
  opts: { coins?: number; diamonds?: number; xp?: number },
) {
  const user = await getUser(userId);
  const coins = Math.max(0, Math.round(opts.coins ?? 0));
  const diamonds = Math.max(0, Math.round(opts.diamonds ?? 0));
  const xp = Math.max(0, Math.round(opts.xp ?? 0));

  const { level, xp: newXp, levelsGained } = applyXpGain(user.level, user.xp, xp);

  const [updated] = await db
    .update(users)
    .set({
      coins: sql`${users.coins} + ${coins}`,
      diamonds: sql`${users.diamonds} + ${diamonds}`,
      lifetimeCoins: sql`${users.lifetimeCoins} + ${coins}`,
      lifetimeDiamonds: sql`${users.lifetimeDiamonds} + ${diamonds}`,
      level,
      xp: newXp,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return { user: updated, levelsGained };
}

/** Spends currency, throwing InsufficientFundsError if the wallet can't cover it. */
export async function spendCurrency(
  userId: string,
  currency: "coins" | "diamonds",
  amount: number,
) {
  const amt = Math.max(0, Math.round(amount));
  const result = await db.transaction(async (tx) => {
    const rows = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (rows.length === 0) throw new Error("User not found");
    const user = rows[0];
    const balance = currency === "coins" ? user.coins : user.diamonds;
    if (balance < amt) throw new InsufficientFundsError(currency);

    const [updated] =
      currency === "coins"
        ? await tx
            .update(users)
            .set({ coins: sql`${users.coins} - ${amt}`, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning()
        : await tx
            .update(users)
            .set({ diamonds: sql`${users.diamonds} - ${amt}`, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();

    return updated;
  });

  return result;
}
