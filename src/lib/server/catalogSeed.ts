// =============================================================================
// CATALOG SEEDING — idempotently upserts all static game-design data (defined
// in src/lib/data/*) into the database. Safe to call on every request; it
// only does work the first time (guarded by an in-process flag) and uses
// ON CONFLICT upserts so re-running after adding new content is always safe.
// =============================================================================

import { db } from "@/db";
import {
  characters,
  skins,
  shopItems,
  products,
  missions,
  achievements,
  dailyRewards,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import { CHARACTERS } from "@/lib/data/characters";
import { SKINS } from "@/lib/data/skins";
import { SHOP_ITEMS, IAP_PRODUCTS } from "@/lib/data/shopItems";
import { MISSIONS } from "@/lib/data/missions";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { DAILY_REWARDS } from "@/lib/data/dailyRewards";

const globalForSeed = globalThis as typeof globalThis & {
  __runnerCatalogSeedPromise?: Promise<void>;
};

export function ensureCatalogSeeded(): Promise<void> {
  if (!globalForSeed.__runnerCatalogSeedPromise) {
    globalForSeed.__runnerCatalogSeedPromise = seedAll().catch((err) => {
      // allow retry on next call if it failed
      globalForSeed.__runnerCatalogSeedPromise = undefined;
      throw err;
    });
  }
  return globalForSeed.__runnerCatalogSeedPromise;
}

async function seedAll() {
  await db
    .insert(characters)
    .values(CHARACTERS)
    .onConflictDoUpdate({
      target: characters.id,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        rarity: sql`excluded.rarity`,
        speed: sql`excluded.speed`,
        jumpPower: sql`excluded.jump_power`,
        health: sql`excluded.health`,
        ability: sql`excluded.ability`,
        abilityDescription: sql`excluded.ability_description`,
        unlockPrice: sql`excluded.unlock_price`,
        unlockCurrency: sql`excluded.unlock_currency`,
        unlockType: sql`excluded.unlock_type`,
        colorHex: sql`excluded.color_hex`,
      },
    });

  await db
    .insert(skins)
    .values(SKINS)
    .onConflictDoUpdate({
      target: skins.id,
      set: {
        name: sql`excluded.name`,
        characterId: sql`excluded.character_id`,
        rarity: sql`excluded.rarity`,
        price: sql`excluded.price`,
        currency: sql`excluded.currency`,
        colorHex: sql`excluded.color_hex`,
        description: sql`excluded.description`,
      },
    });

  const now = Date.now();
  await db
    .insert(shopItems)
    .values(
      SHOP_ITEMS.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        rarity: item.rarity,
        description: item.description,
        price: item.price,
        currency: item.currency,
        refItemType: item.refItemType,
        refItemId: item.refItemId,
        limitedTimeEnd: item.limitedDays
          ? new Date(now + item.limitedDays * 24 * 60 * 60 * 1000)
          : null,
        featured: item.featured ?? false,
        active: true,
      })),
    )
    .onConflictDoNothing({ target: shopItems.id });

  await db
    .insert(products)
    .values(IAP_PRODUCTS)
    .onConflictDoUpdate({
      target: products.id,
      set: {
        type: sql`excluded.type`,
        amount: sql`excluded.amount`,
        bonus: sql`excluded.bonus`,
        description: sql`excluded.description`,
      },
    });

  await db
    .insert(missions)
    .values(MISSIONS)
    .onConflictDoUpdate({
      target: missions.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        type: sql`excluded.type`,
        metric: sql`excluded.metric`,
        target: sql`excluded.target`,
        rewardCoins: sql`excluded.reward_coins`,
        rewardDiamonds: sql`excluded.reward_diamonds`,
        rewardXp: sql`excluded.reward_xp`,
      },
    });

  await db
    .insert(achievements)
    .values(ACHIEVEMENTS)
    .onConflictDoUpdate({
      target: achievements.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        metric: sql`excluded.metric`,
        target: sql`excluded.target`,
        rewardCoins: sql`excluded.reward_coins`,
        rewardDiamonds: sql`excluded.reward_diamonds`,
        rewardXp: sql`excluded.reward_xp`,
      },
    });

  await db
    .insert(dailyRewards)
    .values(
      DAILY_REWARDS.map((r) => ({
        dayIndex: r.dayIndex,
        rewardType: r.rewardType,
        rewardAmount: r.rewardAmount,
        rewardItemKey: r.rewardItemKey,
        description: r.description,
      })),
    )
    .onConflictDoUpdate({
      target: dailyRewards.dayIndex,
      set: {
        rewardType: sql`excluded.reward_type`,
        rewardAmount: sql`excluded.reward_amount`,
        rewardItemKey: sql`excluded.reward_item_key`,
        description: sql`excluded.description`,
      },
    });
}
