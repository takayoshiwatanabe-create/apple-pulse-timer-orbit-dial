import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { useSettingsStore } from "./settingsStore";

const mockGetUserSettings = jest.fn();
const mockUpdateUserSettings = jest.fn();

jest.mock("@/utils/database", () => ({
  getUserSettings: (...args: unknown[]) => mockGetUserSettings(...args),
  updateUserSettings: (...args: unknown[]) => mockUpdateUserSettings(...args),
}));

const DEFAULT_STATE = {
  hapticEnabled: true,
  soundEnabled: true,
  focusModeSync: false,
  theme: "auto" as const,
  premiumActive: false,
  onboardingCompleted: false,
  isLoaded: false,
};

function resetStore() {
  useSettingsStore.setState(DEFAULT_STATE);
}

describe("settingsStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
    mockUpdateUserSettings.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("has sensible defaults", () => {
      const state = useSettingsStore.getState();
      expect(state.hapticEnabled).toBe(true);
      expect(state.soundEnabled).toBe(true);
      expect(state.focusModeSync).toBe(false);
      expect(state.theme).toBe("auto");
      expect(state.premiumActive).toBe(false);
      expect(state.onboardingCompleted).toBe(false);
      expect(state.isLoaded).toBe(false);
    });
  });

  describe("loadSettings", () => {
    it("loads settings from database", async () => {
      mockGetUserSettings.mockResolvedValue({
        hapticEnabled: false,
        soundEnabled: false,
        focusModeSync: true,
        theme: "dark",
        premiumActive: true,
        onboardingCompleted: true,
      });

      await useSettingsStore.getState().loadSettings();
      const state = useSettingsStore.getState();
      expect(state.hapticEnabled).toBe(false);
      expect(state.soundEnabled).toBe(false);
      expect(state.focusModeSync).toBe(true);
      expect(state.theme).toBe("dark");
      expect(state.premiumActive).toBe(true);
      expect(state.onboardingCompleted).toBe(true);
      expect(state.isLoaded).toBe(true);
    });
  });

  describe("updateSettings", () => {
    it("applies partial updates optimistically", async () => {
      await useSettingsStore.getState().updateSettings({ theme: "dark" });
      expect(useSettingsStore.getState().theme).toBe("dark");
      expect(useSettingsStore.getState().hapticEnabled).toBe(true);
    });

    it("persists to database", async () => {
      await useSettingsStore
        .getState()
        .updateSettings({ hapticEnabled: false });
      expect(mockUpdateUserSettings).toHaveBeenCalledWith({
        hapticEnabled: false,
      });
    });

    it("rolls back on database failure", async () => {
      mockUpdateUserSettings.mockRejectedValue(new Error("DB error"));
      await expect(
        useSettingsStore.getState().updateSettings({ theme: "dark" })
      ).rejects.toThrow("Failed to persist settings");
      expect(useSettingsStore.getState().theme).toBe("auto");
    });

    it("rolls back all fields on failure", async () => {
      mockUpdateUserSettings.mockRejectedValue(new Error("DB error"));
      await expect(
        useSettingsStore.getState().updateSettings({
          theme: "dark",
          hapticEnabled: false,
          soundEnabled: false,
        })
      ).rejects.toThrow();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe("auto");
      expect(state.hapticEnabled).toBe(true);
      expect(state.soundEnabled).toBe(true);
    });
  });

  describe("resetSettings", () => {
    it("resets to default values", async () => {
      useSettingsStore.setState({
        theme: "dark",
        hapticEnabled: false,
        premiumActive: true,
      });

      await useSettingsStore.getState().resetSettings();
      const state = useSettingsStore.getState();
      expect(state.theme).toBe("auto");
      expect(state.hapticEnabled).toBe(true);
      expect(state.premiumActive).toBe(false);
    });

    it("persists reset to database", async () => {
      await useSettingsStore.getState().resetSettings();
      expect(mockUpdateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          hapticEnabled: true,
          soundEnabled: true,
          theme: "auto",
        })
      );
    });
  });
});
