// Local, non-critical settings persisted on-device via localStorage, as
// requested in the spec ("JSON/local storage for non-critical local
// settings"). Nothing security-sensitive (coins/diamonds/purchases) is ever
// stored here — that all lives server-side.

export interface GameSettings {
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  graphicsQuality: "low" | "medium" | "high";
  particleEffects: boolean;
  screenShake: boolean;
  fpsDisplay: boolean;
  language: string;
}

const KEY = "runner_settings_v1";

export const DEFAULT_SETTINGS: GameSettings = {
  music: true,
  sfx: true,
  vibration: true,
  graphicsQuality: "medium",
  particleEffects: true,
  screenShake: true,
  fpsDisplay: false,
  language: "en",
};

export function loadSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(settings));
}
