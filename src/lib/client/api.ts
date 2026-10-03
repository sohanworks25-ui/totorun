// Thin fetch wrappers around the /api/game/* backend. Every call here is the
// ONLY way the UI talks to the server-authoritative economy.

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    throw new Error(json.error ?? `Request failed: ${url}`);
  }
  return json as T;
}

export const api = {
  profile: () => call<{ ok: true; user: any; inventory: any[] }>("/api/game/profile"),
  characters: () => call<{ ok: true; characters: any[] }>("/api/game/characters"),
  unlockCharacter: (characterId: string) =>
    call<{ ok: true; result: any }>("/api/game/characters/unlock", {
      method: "POST",
      body: JSON.stringify({ characterId }),
    }),
  skins: () => call<{ ok: true; skins: any[] }>("/api/game/skins"),
  unlockSkin: (skinId: string) =>
    call<{ ok: true; result: any }>("/api/game/skins/unlock", {
      method: "POST",
      body: JSON.stringify({ skinId }),
    }),
  equip: (itemType: string, itemKey: string) =>
    call<{ ok: true }>("/api/game/inventory/equip", {
      method: "POST",
      body: JSON.stringify({ itemType, itemKey }),
    }),
  shop: () => call<{ ok: true; items: any[]; products: any[] }>("/api/game/shop"),
  buyShopItem: (shopItemId: string) =>
    call<{ ok: true; coins: number; diamonds: number }>("/api/game/shop/buy", {
      method: "POST",
      body: JSON.stringify({ shopItemId }),
    }),
  missions: () => call<{ ok: true; missions: any[] }>("/api/game/missions"),
  claimMission: (missionId: string) =>
    call<{ ok: true; user: any }>("/api/game/missions/claim", {
      method: "POST",
      body: JSON.stringify({ missionId }),
    }),
  achievements: () => call<{ ok: true; achievements: any[] }>("/api/game/achievements"),
  claimAchievement: (achievementId: string) =>
    call<{ ok: true; user: any }>("/api/game/achievements/claim", {
      method: "POST",
      body: JSON.stringify({ achievementId }),
    }),
  dailyReward: () =>
    call<{ ok: true; rewards: any[]; status: any; lastDailyRewardDay: number }>(
      "/api/game/daily-reward",
    ),
  claimDailyReward: () =>
    call<{ ok: true; reward: any; user: any }>("/api/game/daily-reward/claim", { method: "POST" }),
  leaderboard: () =>
    call<{ ok: true; entries: any[]; currentUserId: string }>("/api/game/leaderboard"),
  billingProducts: () => call<{ ok: true; products: any[] }>("/api/game/billing/products"),
  purchase: (productId: string, purchaseToken: string, orderId: string) =>
    call<{ ok: true; status: string; coins: number; diamonds: number }>("/api/game/billing/purchase", {
      method: "POST",
      body: JSON.stringify({ productId, purchaseToken, orderId }),
    }),
  restorePurchases: () => call<{ ok: true; purchases: any[] }>("/api/game/billing/restore"),
  submitRun: (payload: {
    score: number;
    distance: number;
    coinsCollected: number;
    diamondsCollected: number;
    jumps: number;
    powerupsUsed: number;
    bossesDefeated: number;
  }) =>
    call<{
      ok: true;
      user: any;
      levelsGained: number;
      isNewHighScore: boolean;
      xpGained: number;
      completedMissions: string[];
      completedAchievements: string[];
      world: string;
    }>("/api/game/run", { method: "POST", body: JSON.stringify(payload) }),
};
