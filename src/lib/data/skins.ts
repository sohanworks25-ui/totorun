import type { Rarity } from "./characters";

export interface SkinDef {
  id: string;
  name: string;
  characterId: string | null; // null = universal skin
  rarity: Rarity;
  price: number;
  currency: "coins" | "diamonds";
  colorHex: string;
  description: string;
}

export const SKINS: SkinDef[] = [
  {
    id: "default",
    name: "Default Outfit",
    characterId: null,
    rarity: "COMMON",
    price: 0,
    currency: "coins",
    colorHex: "#94a3b8",
    description: "The outfit everyone starts with.",
  },
  {
    id: "forest_camo",
    name: "Forest Camo",
    characterId: null,
    rarity: "COMMON",
    price: 500,
    currency: "coins",
    colorHex: "#4ade80",
    description: "Blend into the woods in style.",
  },
  {
    id: "neon_racer",
    name: "Neon Racer",
    characterId: null,
    rarity: "RARE",
    price: 1500,
    currency: "coins",
    colorHex: "#38bdf8",
    description: "Glowing neon trim for night city runs.",
  },
  {
    id: "galaxy_skin",
    name: "Galaxy Skin",
    characterId: null,
    rarity: "LEGENDARY",
    price: 900,
    currency: "diamonds",
    colorHex: "#818cf8",
    description: "Wrapped in a swirling nebula pattern.",
  },
  {
    id: "molten_core",
    name: "Molten Core",
    characterId: null,
    rarity: "EPIC",
    price: 450,
    currency: "diamonds",
    colorHex: "#f97316",
    description: "Cracks of lava glow beneath the surface.",
  },
  {
    id: "phoenix_feather",
    name: "Phoenix Feather",
    characterId: "phoenix_runner",
    rarity: "MYTHIC",
    price: 1200,
    currency: "diamonds",
    colorHex: "#fb7185",
    description: "Ashes that never truly cool.",
  },
];
