export type ThemeMode = "light" | "dark" | "auto";

export interface UserSettings {
  id: number;
  hapticEnabled: boolean;
  soundEnabled: boolean;
  focusModeSync: boolean;
  theme: ThemeMode;
  premiumActive: boolean;
  onboardingCompleted: boolean;
}

export interface SettingsState {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  focusModeSync: boolean;
  theme: ThemeMode;
  premiumActive: boolean;
}
