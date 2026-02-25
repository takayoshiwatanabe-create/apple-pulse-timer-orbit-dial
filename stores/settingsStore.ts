import { create } from "zustand";
import type { ThemeMode } from "@/types";
import { getUserSettings, updateUserSettings } from "@/utils/database";

interface SettingsFields {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  focusModeSync: boolean;
  theme: ThemeMode;
  premiumActive: boolean;
  onboardingCompleted: boolean;
}

interface SettingsStore extends SettingsFields {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SettingsFields>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: SettingsFields = {
  hapticEnabled: true,
  soundEnabled: true,
  focusModeSync: false,
  theme: "auto",
  premiumActive: false,
  onboardingCompleted: false,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    const settings = await getUserSettings();
    set({
      hapticEnabled: settings.hapticEnabled,
      soundEnabled: settings.soundEnabled,
      focusModeSync: settings.focusModeSync,
      theme: settings.theme,
      premiumActive: settings.premiumActive,
      onboardingCompleted: settings.onboardingCompleted,
      isLoaded: true,
    });
  },

  updateSettings: async (partial) => {
    const prev = get();
    set(partial);
    try {
      await updateUserSettings(partial);
    } catch {
      set({
        hapticEnabled: prev.hapticEnabled,
        soundEnabled: prev.soundEnabled,
        focusModeSync: prev.focusModeSync,
        theme: prev.theme,
        premiumActive: prev.premiumActive,
        onboardingCompleted: prev.onboardingCompleted,
      });
      throw new Error("Failed to persist settings");
    }
  },

  resetSettings: async () => {
    set(DEFAULT_SETTINGS);
    await updateUserSettings(DEFAULT_SETTINGS);
  },
}));
