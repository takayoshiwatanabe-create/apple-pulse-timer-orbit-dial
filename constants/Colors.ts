const tintColorLight = "#FF6B35";
const tintColorDark = "#FF8C5A";

export const Colors = {
  light: {
    text: "#1C1C1E",
    textSecondary: "#8E8E93",
    textTertiary: "#AEAEB2",
    background: "#F2F2F7",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    tint: tintColorLight,
    border: "#C6C6C8",
    separator: "#E5E5EA",
    overlay: "rgba(0, 0, 0, 0.4)",

    focusRing: "#FF6B35",
    breakRing: "#34C759",
    longBreakRing: "#5856D6",
    timerBackground: "#F2F2F7",

    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    disabled: "#C7C7CC",

    premiumAccent: "#FFD700",

    tabIconDefault: "#8E8E93",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F2F2F7",
    textSecondary: "#8E8E93",
    textTertiary: "#636366",
    background: "#000000",
    surface: "#1C1C1E",
    surfaceElevated: "#2C2C2E",
    tint: tintColorDark,
    border: "#38383A",
    separator: "#38383A",
    overlay: "rgba(0, 0, 0, 0.6)",

    focusRing: "#FF8C5A",
    breakRing: "#30D158",
    longBreakRing: "#7D7AFF",
    timerBackground: "#1C1C1E",

    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A",
    disabled: "#48484A",

    premiumAccent: "#FFD700",

    tabIconDefault: "#8E8E93",
    tabIconSelected: tintColorDark,
  },
  gradients: {
    focusSand: ["#FF6B35", "#FF8C5A", "#FFB088"],
    breakSand: ["#34C759", "#4CD964", "#86E89B"],
    longBreakSand: ["#5856D6", "#7D7AFF", "#A5A4FF"],
    premium: ["#FFD700", "#FFA500", "#FF8C00"],
  },
} as const;

export type ColorScheme = "light" | "dark";
export type ThemeColors = typeof Colors.light;
