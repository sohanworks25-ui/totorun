// =============================================================================
// CHARACTER CATALOG — static design data, seeded into the `characters` table.
// Adding a new character = add one entry here + reseed. No code changes
// elsewhere are required (shop, unlock flow and HUD all read from the DB).
// =============================================================================

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

export interface CharacterDef {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  speed: number; // 1-10
  jumpPower: number; // 1-10
  health: number; // base HP
  ability: string;
  abilityDescription: string;
  unlockPrice: number;
  unlockCurrency: "coins" | "diamonds" | "free";
  unlockType: "default" | "currency" | "achievement" | "event";
  colorHex: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: "runner",
    name: "Runner",
    description: "The balanced all-rounder every career starts with.",
    rarity: "COMMON",
    speed: 5,
    jumpPower: 5,
    health: 100,
    ability: "Steady Pace",
    abilityDescription: "Slight stamina regen, no special effect.",
    unlockPrice: 0,
    unlockCurrency: "free",
    unlockType: "default",
    colorHex: "#60a5fa",
  },
  {
    id: "speedster",
    name: "Speedster",
    description: "Built for raw velocity. Outruns every hazard.",
    rarity: "COMMON",
    speed: 8,
    jumpPower: 4,
    health: 90,
    ability: "Burst Dash",
    abilityDescription: "Short speed burst that phases through obstacles.",
    unlockPrice: 2000,
    unlockCurrency: "coins",
    unlockType: "currency",
    colorHex: "#34d399",
  },
  {
    id: "jumper",
    name: "Jumper",
    description: "Springy legs make tricky platforming trivial.",
    rarity: "RARE",
    speed: 5,
    jumpPower: 9,
    health: 95,
    ability: "Triple Jump",
    abilityDescription: "Grants one extra mid-air jump for a short time.",
    unlockPrice: 4500,
    unlockCurrency: "coins",
    unlockType: "currency",
    colorHex: "#fbbf24",
  },
  {
    id: "collector",
    name: "Collector",
    description: "Magnetic fingers. Never misses a coin again.",
    rarity: "RARE",
    speed: 5,
    jumpPower: 5,
    health: 100,
    ability: "Auto Magnet",
    abilityDescription: "Pulls in all nearby coins and diamonds.",
    unlockPrice: 300,
    unlockCurrency: "diamonds",
    unlockType: "currency",
    colorHex: "#f472b6",
  },
  {
    id: "tank",
    name: "Tank",
    description: "Slow, heavy, and nearly unstoppable.",
    rarity: "EPIC",
    speed: 4,
    jumpPower: 4,
    health: 160,
    ability: "Bulwark",
    abilityDescription: "Shatters the next obstacle instead of colliding.",
    unlockPrice: 500,
    unlockCurrency: "diamonds",
    unlockType: "currency",
    colorHex: "#a3a3a3",
  },
  {
    id: "shadow_runner",
    name: "Shadow Runner",
    description: "Master of the shadows, slipping past every danger.",
    rarity: "LEGENDARY",
    speed: 7,
    jumpPower: 7,
    health: 110,
    ability: "Shadow Step",
    abilityDescription: "Become briefly invincible and untouchable.",
    unlockPrice: 750,
    unlockCurrency: "diamonds",
    unlockType: "currency",
    colorHex: "#6d28d9",
  },
  {
    id: "cyber_ninja",
    name: "Cyber Ninja",
    description: "Augmented reflexes forged in neon circuitry.",
    rarity: "EPIC",
    speed: 7,
    jumpPower: 6,
    health: 105,
    ability: "Overclock",
    abilityDescription: "Slows down the world around you briefly.",
    unlockPrice: 500,
    unlockCurrency: "diamonds",
    unlockType: "currency",
    colorHex: "#22d3ee",
  },
  {
    id: "golden_runner",
    name: "Golden Runner",
    description: "Everything they touch turns to gold... almost.",
    rarity: "LEGENDARY",
    speed: 6,
    jumpPower: 6,
    health: 115,
    ability: "Midas Rush",
    abilityDescription: "Doubles coin value for a short time.",
    unlockPrice: 850,
    unlockCurrency: "diamonds",
    unlockType: "currency",
    colorHex: "#eab308",
  },
  {
    id: "galaxy_runner",
    name: "Galaxy Runner",
    description: "Pulled from the stars, moves like gravity doesn't apply.",
    rarity: "MYTHIC",
    speed: 8,
    jumpPower: 8,
    health: 120,
    ability: "Zero-G Glide",
    abilityDescription: "Float gently over obstacles for a few seconds.",
    unlockPrice: 1500,
    unlockCurrency: "diamonds",
    unlockType: "currency",
    colorHex: "#818cf8",
  },
  {
    id: "phoenix_runner",
    name: "Phoenix Runner",
    description: "Rises from the ashes of every mistake.",
    rarity: "MYTHIC",
    speed: 7,
    jumpPower: 7,
    health: 130,
    ability: "Rebirth",
    abilityDescription: "Automatically revives once per run after a hit.",
    unlockPrice: 1500,
    unlockCurrency: "diamonds",
    unlockType: "event",
    colorHex: "#fb7185",
  },
];

export const RARITY_ORDER: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];

export const RARITY_STYLES: Record<Rarity, { border: string; glow: string; text: string; badge: string }> = {
  COMMON: { border: "border-slate-500", glow: "", text: "text-slate-300", badge: "bg-slate-600" },
  RARE: { border: "border-sky-400", glow: "shadow-[0_0_16px_rgba(56,189,248,0.45)]", text: "text-sky-300", badge: "bg-sky-600" },
  EPIC: { border: "border-fuchsia-400", glow: "shadow-[0_0_18px_rgba(217,70,239,0.5)]", text: "text-fuchsia-300", badge: "bg-fuchsia-600" },
  LEGENDARY: { border: "border-amber-400", glow: "shadow-[0_0_22px_rgba(251,191,36,0.6)]", text: "text-amber-300", badge: "bg-amber-500" },
  MYTHIC: { border: "border-rose-400", glow: "shadow-[0_0_26px_rgba(244,63,94,0.7)]", text: "text-rose-300", badge: "bg-rose-600" },
};
