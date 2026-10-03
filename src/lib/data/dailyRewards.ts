export interface DailyRewardDef {
  dayIndex: number;
  rewardType: "coins" | "diamonds" | "powerup" | "skin";
  rewardAmount: number;
  rewardItemKey: string | null;
  description: string;
}

export const DAILY_REWARDS: DailyRewardDef[] = [
  { dayIndex: 1, rewardType: "coins", rewardAmount: 100, rewardItemKey: null, description: "100 Coins" },
  { dayIndex: 2, rewardType: "coins", rewardAmount: 250, rewardItemKey: null, description: "250 Coins" },
  { dayIndex: 3, rewardType: "diamonds", rewardAmount: 5, rewardItemKey: null, description: "5 Diamonds" },
  { dayIndex: 4, rewardType: "coins", rewardAmount: 500, rewardItemKey: null, description: "500 Coins" },
  { dayIndex: 5, rewardType: "diamonds", rewardAmount: 10, rewardItemKey: null, description: "10 Diamonds" },
  { dayIndex: 6, rewardType: "powerup", rewardAmount: 3, rewardItemKey: "shield", description: "3x Shield Power-up" },
  { dayIndex: 7, rewardType: "skin", rewardAmount: 1, rewardItemKey: "neon_racer", description: "Rare Skin: Neon Racer" },
];
