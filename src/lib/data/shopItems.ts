import type { Rarity } from "./characters";

export type ShopCategory =
  | "FEATURED"
  | "CHARACTERS"
  | "SKINS"
  | "TRAILS"
  | "EFFECTS"
  | "POWER-UPS"
  | "UPGRADES"
  | "DIAMONDS"
  | "COINS"
  | "EVENT ITEMS";

export interface ShopItemDef {
  id: string;
  name: string;
  category: ShopCategory;
  rarity: Rarity;
  description: string;
  price: number;
  currency: "coins" | "diamonds";
  refItemType: "character" | "skin" | "trail" | "effect" | "powerup" | "upgrade";
  refItemId: string;
  limitedDays?: number; // if set, expires `limitedDays` from seed time
  featured?: boolean;
}

// Non-character / non-skin cosmetics & consumables that live purely in the
// shop + inventory (no dedicated catalog table needed for these).
export const SHOP_ITEMS: ShopItemDef[] = [
  // ---- Characters available for direct diamond purchase (featured) ----
  { id: "shop_shadow_runner", name: "Shadow Runner", category: "CHARACTERS", rarity: "LEGENDARY", description: "Master of the shadows.", price: 750, currency: "diamonds", refItemType: "character", refItemId: "shadow_runner", featured: true },
  { id: "shop_cyber_ninja", name: "Cyber Ninja", category: "CHARACTERS", rarity: "EPIC", description: "Augmented reflexes, neon style.", price: 500, currency: "diamonds", refItemType: "character", refItemId: "cyber_ninja" },
  { id: "shop_golden_runner", name: "Golden Runner", category: "CHARACTERS", rarity: "LEGENDARY", description: "Midas touch on the run.", price: 850, currency: "diamonds", refItemType: "character", refItemId: "golden_runner" },
  { id: "shop_galaxy_runner", name: "Galaxy Runner", category: "CHARACTERS", rarity: "MYTHIC", description: "Gravity barely applies.", price: 1500, currency: "diamonds", refItemType: "character", refItemId: "galaxy_runner" },
  {
    id: "shop_phoenix_runner",
    name: "Phoenix Runner",
    category: "CHARACTERS",
    rarity: "MYTHIC",
    description: "Rises from the ashes. Limited time arrival!",
    price: 1500,
    currency: "diamonds",
    refItemType: "character",
    refItemId: "phoenix_runner",
    limitedDays: 6.6,
    featured: true,
  },

  // ---- Skins ----
  { id: "shop_galaxy_skin", name: "Galaxy Skin", category: "SKINS", rarity: "LEGENDARY", description: "A swirling nebula pattern.", price: 900, currency: "diamonds", refItemType: "skin", refItemId: "galaxy_skin", featured: true },
  { id: "shop_molten_core", name: "Molten Core", category: "SKINS", rarity: "EPIC", description: "Cracks of lava glow beneath the surface.", price: 450, currency: "diamonds", refItemType: "skin", refItemId: "molten_core" },
  { id: "shop_neon_racer", name: "Neon Racer", category: "SKINS", rarity: "RARE", description: "Glowing neon trim for night runs.", price: 1500, currency: "coins", refItemType: "skin", refItemId: "neon_racer" },
  { id: "shop_forest_camo", name: "Forest Camo", category: "SKINS", rarity: "COMMON", description: "Blend into the woods.", price: 500, currency: "coins", refItemType: "skin", refItemId: "forest_camo" },
  { id: "shop_phoenix_feather", name: "Phoenix Feather", category: "SKINS", rarity: "MYTHIC", description: "Ashes that never truly cool.", price: 1200, currency: "diamonds", refItemType: "skin", refItemId: "phoenix_feather" },

  // ---- Trails ----
  { id: "trail_dragon", name: "Dragon Trail", category: "TRAILS", rarity: "MYTHIC", description: "A trail of dragonfire behind every step.", price: 700, currency: "diamonds", refItemType: "trail", refItemId: "dragon_trail", featured: true },
  { id: "trail_sparkle", name: "Sparkle Trail", category: "TRAILS", rarity: "RARE", description: "Leave a trail of sparkles.", price: 800, currency: "coins", refItemType: "trail", refItemId: "sparkle_trail" },
  { id: "trail_shadow", name: "Shadow Wisp", category: "TRAILS", rarity: "EPIC", description: "Dark smoky wisps follow your every move.", price: 380, currency: "diamonds", refItemType: "trail", refItemId: "shadow_wisp" },

  // ---- Effects ----
  { id: "effect_lightning_boots", name: "Lightning Boots", category: "EFFECTS", rarity: "EPIC", description: "Electric sparks on every landing.", price: 350, currency: "diamonds", refItemType: "effect", refItemId: "lightning_boots", featured: true },
  { id: "effect_golden_aura", name: "Golden Aura", category: "EFFECTS", rarity: "LEGENDARY", description: "A radiant golden glow around your runner.", price: 650, currency: "diamonds", refItemType: "effect", refItemId: "golden_aura" },

  // ---- Power-up packs (consumable boosts bought with coins) ----
  { id: "pwr_shield_pack", name: "Shield Pack x5", category: "POWER-UPS", rarity: "COMMON", description: "5 instant shield charges for your next runs.", price: 400, currency: "coins", refItemType: "powerup", refItemId: "shield" },
  { id: "pwr_magnet_pack", name: "Magnet Pack x5", category: "POWER-UPS", rarity: "COMMON", description: "5 instant coin-magnet charges.", price: 400, currency: "coins", refItemType: "powerup", refItemId: "magnet" },
  { id: "pwr_multiplier_pack", name: "Coin x2 Pack x5", category: "POWER-UPS", rarity: "RARE", description: "5 charges of double-coin value.", price: 300, currency: "diamonds", refItemType: "powerup", refItemId: "multiplier" },

  // ---- Upgrades (permanent, progressively more expensive — bought repeatedly) ----
  { id: "up_speed", name: "Starting Speed +1", category: "UPGRADES", rarity: "COMMON", description: "Permanently increases your starting speed.", price: 800, currency: "coins", refItemType: "upgrade", refItemId: "speed" },
  { id: "up_jump", name: "Jump Power +1", category: "UPGRADES", rarity: "COMMON", description: "Jump higher and clear taller obstacles.", price: 800, currency: "coins", refItemType: "upgrade", refItemId: "jump" },
  { id: "up_shield", name: "Shield Duration +1s", category: "UPGRADES", rarity: "RARE", description: "Shield power-ups last longer.", price: 1200, currency: "coins", refItemType: "upgrade", refItemId: "shield_duration" },
  { id: "up_magnet", name: "Magnet Radius +1", category: "UPGRADES", rarity: "RARE", description: "Magnet power-up pulls from further away.", price: 1200, currency: "coins", refItemType: "upgrade", refItemId: "magnet_radius" },
  { id: "up_coin_mult", name: "Coin Multiplier +5%", category: "UPGRADES", rarity: "EPIC", description: "Passively earn more coins every run.", price: 150, currency: "diamonds", refItemType: "upgrade", refItemId: "coin_multiplier" },
  { id: "up_powerup_duration", name: "Power-up Duration +1s", category: "UPGRADES", rarity: "EPIC", description: "All power-ups last a little longer.", price: 150, currency: "diamonds", refItemType: "upgrade", refItemId: "powerup_duration" },
  { id: "up_health", name: "Max Health +10", category: "UPGRADES", rarity: "RARE", description: "Survive one more hit before dying.", price: 1500, currency: "coins", refItemType: "upgrade", refItemId: "health" },

  // ---- Event items ----
  { id: "event_winter_skin", name: "Frostbite Skin", category: "EVENT ITEMS", rarity: "EPIC", description: "Winter Event exclusive — icy blue runner skin.", price: 380, currency: "diamonds", refItemType: "skin", refItemId: "frostbite_skin", limitedDays: 10 },
];

// IAP product catalog (Google Play Billing product IDs). Real-money price is
// NEVER hard-coded — it is configured in Google Play Console and surfaced to
// the client by the Billing Library at runtime.
export interface IapProductDef {
  id: string;
  type: "coins" | "diamonds";
  amount: number;
  bonus: number;
  description: string;
}

export const IAP_PRODUCTS: IapProductDef[] = [
  { id: "coin_pack_1000", type: "coins", amount: 1000, bonus: 0, description: "A handful of coins to get started." },
  { id: "coin_pack_5000", type: "coins", amount: 5000, bonus: 250, description: "A solid coin pouch with bonus coins." },
  { id: "coin_pack_15000", type: "coins", amount: 15000, bonus: 1000, description: "A big coin chest." },
  { id: "coin_pack_50000", type: "coins", amount: 50000, bonus: 5000, description: "The coin vault. Best value." },
  { id: "diamond_pack_50", type: "diamonds", amount: 50, bonus: 0, description: "A small pouch of diamonds." },
  { id: "diamond_pack_120", type: "diamonds", amount: 120, bonus: 10, description: "A handful of diamonds with a bonus." },
  { id: "diamond_pack_300", type: "diamonds", amount: 300, bonus: 30, description: "A diamond case." },
  { id: "diamond_pack_700", type: "diamonds", amount: 700, bonus: 90, description: "A diamond chest." },
  { id: "diamond_pack_1500", type: "diamonds", amount: 1500, bonus: 250, description: "A diamond vault." },
  { id: "diamond_pack_3500", type: "diamonds", amount: 3500, bonus: 750, description: "The ultimate diamond hoard." },
];
