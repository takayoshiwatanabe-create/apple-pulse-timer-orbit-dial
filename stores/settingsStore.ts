import { create } from "zustand";
import type { ThemeMode } from "@/types";
import { getUserSettings, updateUserSettings } from "@/utils/database";

interface SettingsStore {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  focusModeSync: boolean;
  theme: ThemeMode;
  premiumActive: boolean;
  onboardingCompleted: boolean;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<SettingsStore, "isLoaded" | "loadSettings" | "updateSettings">>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  hapticEnabled: true,
  soundEnabled: true,
  focusModeSync: false,
  theme: "auto",
  premiumActive: false,
  onboardingCompleted: false,
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
    set(partial);
    await updateUserSettings(partial);
  },
}));
