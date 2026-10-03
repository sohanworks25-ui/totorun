export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  metric: "runs" | "coinsLifetime" | "diamondsLifetime" | "distanceLifetime" | "bosses" | "legendaryOwned" | "skinsOwned" | "coinsLifetimeMillion";
  target: number;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardXp: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "ach_first_run", title: "First Run", description: "Complete your very first run.", metric: "runs", target: 1, rewardCoins: 100, rewardDiamonds: 5, rewardXp: 50 },
  { id: "ach_coin_collector", title: "Coin Collector", description: "Collect 10,000 lifetime coins.", metric: "coinsLifetime", target: 10000, rewardCoins: 500, rewardDiamonds: 10, rewardXp: 150 },
  { id: "ach_diamond_hunter", title: "Diamond Hunter", description: "Collect 500 lifetime diamonds.", metric: "diamondsLifetime", target: 500, rewardCoins: 0, rewardDiamonds: 50, rewardXp: 200 },
  { id: "ach_1000m", title: "1,000m Runner", description: "Reach a total distance of 1,000m.", metric: "distanceLifetime", target: 1000, rewardCoins: 200, rewardDiamonds: 5, rewardXp: 80 },
  { id: "ach_10000m", title: "10,000m Runner", description: "Reach a total distance of 10,000m.", metric: "distanceLifetime", target: 10000, rewardCoins: 800, rewardDiamonds: 15, rewardXp: 200 },
  { id: "ach_100000m", title: "100,000m Runner", description: "Reach a total distance of 100,000m.", metric: "distanceLifetime", target: 100000, rewardCoins: 3000, rewardDiamonds: 60, rewardXp: 600 },
  { id: "ach_first_boss", title: "First Boss", description: "Defeat your first boss.", metric: "bosses", target: 1, rewardCoins: 300, rewardDiamonds: 10, rewardXp: 100 },
  { id: "ach_boss_hunter", title: "Boss Hunter", description: "Defeat 25 bosses.", metric: "bosses", target: 25, rewardCoins: 1500, rewardDiamonds: 40, rewardXp: 400 },
  { id: "ach_legendary_collector", title: "Legendary Collector", description: "Own 3 Legendary or Mythic characters/skins.", metric: "legendaryOwned", target: 3, rewardCoins: 0, rewardDiamonds: 80, rewardXp: 350 },
  { id: "ach_skin_collector", title: "Skin Collector", description: "Own 5 skins.", metric: "skinsOwned", target: 5, rewardCoins: 600, rewardDiamonds: 10, rewardXp: 150 },
  { id: "ach_millionaire", title: "Millionaire", description: "Collect 1,000,000 lifetime coins.", metric: "coinsLifetimeMillion", target: 1000000, rewardCoins: 0, rewardDiamonds: 200, rewardXp: 1000 },
  { id: "ach_diamond_master", title: "Diamond Master", description: "Collect 2,000 lifetime diamonds.", metric: "diamondsLifetime", target: 2000, rewardCoins: 0, rewardDiamonds: 150, rewardXp: 500 },
];
