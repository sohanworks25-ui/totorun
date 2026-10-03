"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/client/api";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type GameSettings } from "@/lib/client/settings";
import type {
  AchievementView,
  CharacterView,
  InventoryItem,
  IapProductView,
  LeaderboardEntryView,
  MissionView,
  ShopItemView,
  SkinView,
  UserProfile,
} from "@/lib/client/types";

interface GameDataState {
  loading: boolean;
  online: boolean;
  profile: UserProfile | null;
  inventory: InventoryItem[];
  characters: CharacterView[];
  skins: SkinView[];
  shopItems: ShopItemView[];
  iapProducts: IapProductView[];
  missions: MissionView[];
  achievements: AchievementView[];
  leaderboard: LeaderboardEntryView[];
  settings: GameSettings;
  refreshAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshShop: () => Promise<void>;
  refreshMissions: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  updateSettings: (patch: Partial<GameSettings>) => void;
  powerupCharges: { shield: number; magnet: number; multiplier: number };
  upgrades: Record<string, number>;
}

const GameDataContext = createContext<GameDataState | null>(null);

const UPGRADE_KEYS = [
  "speed",
  "jump",
  "shield_duration",
  "magnet_radius",
  "coin_multiplier",
  "powerup_duration",
  "health",
];

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [characters, setCharacters] = useState<CharacterView[]>([]);
  const [skins, setSkins] = useState<SkinView[]>([]);
  const [shopItems, setShopItems] = useState<ShopItemView[]>([]);
  const [iapProducts, setIapProducts] = useState<IapProductView[]>([]);
  const [missions, setMissions] = useState<MissionView[]>([]);
  const [achievements, setAchievements] = useState<AchievementView[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryView[]>([]);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.profile();
      setProfile(res.user);
      setInventory(res.inventory);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshCharacters = useCallback(async () => {
    try {
      const res = await api.characters();
      setCharacters(res.characters);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshSkins = useCallback(async () => {
    try {
      const res = await api.skins();
      setSkins(res.skins);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshShop = useCallback(async () => {
    try {
      const res = await api.shop();
      setShopItems(res.items);
      const products = await api.billingProducts();
      setIapProducts(products.products);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshMissions = useCallback(async () => {
    try {
      const res = await api.missions();
      setMissions(res.missions);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshAchievements = useCallback(async () => {
    try {
      const res = await api.achievements();
      setAchievements(res.achievements);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const res = await api.leaderboard();
      setLeaderboard(res.entries);
    } catch {
      setOnline(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshProfile(),
      refreshCharacters(),
      refreshSkins(),
      refreshShop(),
      refreshMissions(),
      refreshAchievements(),
      refreshLeaderboard(),
    ]);
    setLoading(false);
  }, [
    refreshProfile,
    refreshCharacters,
    refreshSkins,
    refreshShop,
    refreshMissions,
    refreshAchievements,
    refreshLeaderboard,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const powerupCharges = useMemo(() => {
    const find = (key: string) =>
      inventory.find((i) => i.itemType === "powerup" && i.itemKey === key)?.level ?? 0;
    return { shield: find("shield"), magnet: find("magnet"), multiplier: find("multiplier") };
  }, [inventory]);

  const upgrades = useMemo(() => {
    const result: Record<string, number> = {};
    for (const key of UPGRADE_KEYS) {
      result[key] = inventory.find((i) => i.itemType === "upgrade" && i.itemKey === key)?.level ?? 0;
    }
    return result;
  }, [inventory]);

  const value: GameDataState = {
    loading,
    online,
    profile,
    inventory,
    characters,
    skins,
    shopItems,
    iapProducts,
    missions,
    achievements,
    leaderboard,
    settings,
    refreshAll,
    refreshProfile,
    refreshShop,
    refreshMissions,
    refreshAchievements,
    refreshLeaderboard,
    updateSettings,
    powerupCharges,
    upgrades,
  };

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error("useGameData must be used within GameDataProvider");
  return ctx;
}
