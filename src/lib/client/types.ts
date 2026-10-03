// Client-side view models (loosely mirror the DB rows returned by the API).

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  diamonds: number;
  highestScore: number;
  totalDistance: number;
  lifetimeCoins: number;
  lifetimeDiamonds: number;
  totalJumps: number;
  totalPowerupsUsed: number;
  runsCompleted: number;
  bossesDefeated: number;
  selectedCharacter: string;
  selectedSkin: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemType: string;
  itemKey: string;
  level: number;
  owned: boolean;
  equipped: boolean;
}

export interface CharacterView {
  id: string;
  name: string;
  description: string;
  rarity: string;
  speed: number;
  jumpPower: number;
  health: number;
  ability: string;
  abilityDescription: string;
  unlockPrice: number;
  unlockCurrency: string;
  unlockType: string;
  colorHex: string;
  owned: boolean;
  equipped: boolean;
}

export interface SkinView {
  id: string;
  name: string;
  characterId: string | null;
  rarity: string;
  price: number;
  currency: string;
  colorHex: string;
  description: string;
  owned: boolean;
  equipped: boolean;
}

export interface ShopItemView {
  id: string;
  name: string;
  category: string;
  rarity: string;
  description: string;
  price: number;
  currency: string;
  refItemType: string;
  refItemId: string;
  featured: boolean;
  owned: boolean;
  equipped: boolean;
  level: number;
  currentPrice: number;
  msRemaining: number | null;
}

export interface MissionView {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  metric: string;
  target: number;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardXp: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface AchievementView {
  id: string;
  title: string;
  description: string;
  metric: string;
  target: number;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardXp: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface IapProductView {
  id: string;
  type: "coins" | "diamonds";
  amount: number;
  bonus: number;
  description: string;
}

export interface LeaderboardEntryView {
  id: string;
  userId: string;
  username: string;
  score: number;
  distance: number;
  worldId: string;
}
