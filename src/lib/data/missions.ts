export interface MissionDef {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  metric: "distance" | "coins" | "diamonds" | "jumps" | "powerups" | "bosses" | "runs";
  target: number;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardXp: number;
}

export const MISSIONS: MissionDef[] = [
  // Daily
  { id: "daily_run_1000", title: "Morning Jog", description: "Run 1,000m in total today.", type: "daily", metric: "distance", target: 1000, rewardCoins: 150, rewardDiamonds: 0, rewardXp: 50 },
  { id: "daily_collect_100_coins", title: "Coin Grabber", description: "Collect 100 Coins.", type: "daily", metric: "coins", target: 100, rewardCoins: 100, rewardDiamonds: 0, rewardXp: 30 },
  { id: "daily_collect_5_diamonds", title: "Gem Hunter", description: "Collect 5 Diamonds.", type: "daily", metric: "diamonds", target: 5, rewardCoins: 0, rewardDiamonds: 5, rewardXp: 40 },
  { id: "daily_jump_30", title: "Hop To It", description: "Jump 30 times.", type: "daily", metric: "jumps", target: 30, rewardCoins: 120, rewardDiamonds: 0, rewardXp: 25 },
  { id: "daily_use_3_powerups", title: "Power Player", description: "Use 3 Power-ups.", type: "daily", metric: "powerups", target: 3, rewardCoins: 100, rewardDiamonds: 1, rewardXp: 35 },

  // Weekly
  { id: "weekly_run_25000", title: "Marathoner", description: "Run 25,000m this week.", type: "weekly", metric: "distance", target: 25000, rewardCoins: 1500, rewardDiamonds: 10, rewardXp: 300 },
  { id: "weekly_collect_5000_coins", title: "Coin Tycoon", description: "Collect 5,000 Coins.", type: "weekly", metric: "coins", target: 5000, rewardCoins: 800, rewardDiamonds: 5, rewardXp: 200 },
  { id: "weekly_defeat_3_bosses", title: "Boss Slayer", description: "Defeat 3 Bosses.", type: "weekly", metric: "bosses", target: 3, rewardCoins: 1000, rewardDiamonds: 20, rewardXp: 250 },
  { id: "weekly_20_runs", title: "Dedicated Runner", description: "Complete 20 runs.", type: "weekly", metric: "runs", target: 20, rewardCoins: 1200, rewardDiamonds: 15, rewardXp: 220 },
];
