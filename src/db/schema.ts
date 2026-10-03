// =============================================================================
// DATABASE SCHEMA — Android Endless Runner (server-authoritative economy)
// =============================================================================
// This schema backs the whole game economy: accounts, wallets (coins/diamonds),
// inventory, catalog (characters/skins/shop items/IAP products), missions,
// achievements, daily rewards, purchases (Google Play Billing ledger) and the
// leaderboard. It is deliberately normalized so new content (characters,
// worlds, shop items, events) can be added purely as new rows — no schema
// rewrite required.
// =============================================================================

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  unique,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------------------
// USERS — the player account. Coins/diamonds/XP/level live here and are only
// ever mutated by server code (API routes), never trusted from the client.
// -----------------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  diamonds: integer("diamonds").notNull().default(0),
  highestScore: integer("highest_score").notNull().default(0),
  totalDistance: integer("total_distance").notNull().default(0),
  lifetimeCoins: integer("lifetime_coins").notNull().default(0),
  lifetimeDiamonds: integer("lifetime_diamonds").notNull().default(0),
  totalJumps: integer("total_jumps").notNull().default(0),
  totalPowerupsUsed: integer("total_powerups_used").notNull().default(0),
  runsCompleted: integer("runs_completed").notNull().default(0),
  bossesDefeated: integer("bosses_defeated").notNull().default(0),
  selectedCharacter: text("selected_character").notNull().default("runner"),
  selectedSkin: text("selected_skin").notNull().default("default"),
  lastDailyRewardDay: integer("last_daily_reward_day").notNull().default(0),
  lastDailyRewardAt: timestamp("last_daily_reward_at"),
  dailyRewardCycleStart: timestamp("daily_reward_cycle_start"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// CHARACTERS CATALOG
// -----------------------------------------------------------------------------
export const characters = pgTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(),
  speed: integer("speed").notNull(),
  jumpPower: integer("jump_power").notNull(),
  health: integer("health").notNull(),
  ability: text("ability").notNull(),
  abilityDescription: text("ability_description").notNull(),
  unlockPrice: integer("unlock_price").notNull().default(0),
  unlockCurrency: text("unlock_currency").notNull().default("coins"),
  unlockType: text("unlock_type").notNull().default("currency"),
  colorHex: text("color_hex").notNull(),
});

// -----------------------------------------------------------------------------
// SKINS CATALOG
// -----------------------------------------------------------------------------
export const skins = pgTable("skins", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  characterId: text("character_id"),
  rarity: text("rarity").notNull(),
  price: integer("price").notNull().default(0),
  currency: text("currency").notNull().default("coins"),
  colorHex: text("color_hex").notNull(),
  description: text("description").notNull(),
});

// -----------------------------------------------------------------------------
// SHOP ITEMS CATALOG — trails, effects, power-ups, upgrades, event items and
// references to characters/skins so the shop can present them uniformly.
// -----------------------------------------------------------------------------
export const shopItems = pgTable("shop_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull(),
  refItemType: text("ref_item_type").notNull(),
  refItemId: text("ref_item_id").notNull(),
  limitedTimeEnd: timestamp("limited_time_end"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

// -----------------------------------------------------------------------------
// IAP PRODUCTS — mirrors the Google Play Billing product catalog. Prices are
// intentionally NOT stored here: real money price is controlled by Google
// Play Console and returned at runtime by the Billing Library.
// -----------------------------------------------------------------------------
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  bonus: integer("bonus").notNull().default(0),
  description: text("description").notNull(),
});

// -----------------------------------------------------------------------------
// INVENTORY — what a player owns/equips (characters, skins, trails, effects,
// power-ups, upgrades).
// -----------------------------------------------------------------------------
export const inventory = pgTable(
  "inventory",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    itemType: text("item_type").notNull(),
    itemKey: text("item_key").notNull(),
    level: integer("level").notNull().default(1),
    owned: boolean("owned").notNull().default(true),
    equipped: boolean("equipped").notNull().default(false),
    acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
  },
  (t) => [unique("inventory_user_item_unique").on(t.userId, t.itemType, t.itemKey)],
);

// -----------------------------------------------------------------------------
// PURCHASES — authoritative Google Play Billing transaction ledger.
// googlePurchaseToken is UNIQUE so a replayed/duplicated token can never be
// processed twice (prevents duplicate currency grants / fraud).
// -----------------------------------------------------------------------------
export const purchases = pgTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    productId: text("product_id").notNull(),
    googlePurchaseToken: text("google_purchase_token").notNull(),
    orderId: text("order_id").notNull(),
    purchaseState: text("purchase_state").notNull(),
    quantity: integer("quantity").notNull().default(1),
    currencyGranted: integer("currency_granted").notNull().default(0),
    purchaseTime: timestamp("purchase_time").notNull(),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("purchases_token_unique").on(t.googlePurchaseToken)],
);

// -----------------------------------------------------------------------------
// MISSIONS (daily / weekly) CATALOG + per-user progress
// -----------------------------------------------------------------------------
export const missions = pgTable("missions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'daily' | 'weekly'
  metric: text("metric").notNull(), // distance|coins|diamonds|jumps|powerups|bosses|runs
  target: integer("target").notNull(),
  rewardCoins: integer("reward_coins").notNull().default(0),
  rewardDiamonds: integer("reward_diamonds").notNull().default(0),
  rewardXp: integer("reward_xp").notNull().default(0),
});

export const userMissionProgress = pgTable(
  "user_mission_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    missionId: text("mission_id").notNull(),
    periodKey: text("period_key").notNull(),
    progress: integer("progress").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    claimed: boolean("claimed").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("mission_progress_unique").on(t.userId, t.missionId, t.periodKey),
  ],
);

// -----------------------------------------------------------------------------
// ACHIEVEMENTS CATALOG + per-user progress
// -----------------------------------------------------------------------------
export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  metric: text("metric").notNull(),
  target: integer("target").notNull(),
  rewardCoins: integer("reward_coins").notNull().default(0),
  rewardDiamonds: integer("reward_diamonds").notNull().default(0),
  rewardXp: integer("reward_xp").notNull().default(0),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    achievementId: text("achievement_id").notNull(),
    progress: integer("progress").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    claimed: boolean("claimed").notNull().default(false),
    completedAt: timestamp("completed_at"),
  },
  (t) => [unique("user_achievement_unique").on(t.userId, t.achievementId)],
);

// -----------------------------------------------------------------------------
// DAILY REWARDS — 7-day login cycle catalog + per-user claims
// -----------------------------------------------------------------------------
export const dailyRewards = pgTable("daily_rewards", {
  id: serial("id").primaryKey(),
  dayIndex: integer("day_index").notNull().unique(),
  rewardType: text("reward_type").notNull(), // coins|diamonds|powerup|skin
  rewardAmount: integer("reward_amount").notNull().default(0),
  rewardItemKey: text("reward_item_key"),
  description: text("description").notNull(),
});

// -----------------------------------------------------------------------------
// LEADERBOARD
// -----------------------------------------------------------------------------
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  score: integer("score").notNull(),
  distance: integer("distance").notNull(),
  worldId: text("world_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// RUNS — per-session gameplay log (used for mission/achievement progress and
// basic anti-cheat sanity checks).
// -----------------------------------------------------------------------------
export const runs = pgTable("runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  score: integer("score").notNull(),
  distance: integer("distance").notNull(),
  coinsCollected: integer("coins_collected").notNull().default(0),
  diamondsCollected: integer("diamonds_collected").notNull().default(0),
  xpGained: integer("xp_gained").notNull().default(0),
  jumps: integer("jumps").notNull().default(0),
  powerupsUsed: integer("powerups_used").notNull().default(0),
  bossesDefeated: integer("bosses_defeated").notNull().default(0),
  worldId: text("world_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
