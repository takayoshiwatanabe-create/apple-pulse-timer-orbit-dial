import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const Layout = {
  window: { width, height },
  isSmallDevice: width < 375,

  timerSize: Math.min(width * 0.8, 320),
  bezelSize: Math.min(width * 0.85, 340),
  progressRingStroke: 8,
  progressRingRadius: Math.min(width * 0.8, 320) / 2 - 8,

  hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
  minTouchTarget: 44,

  tabBarHeight: Platform.OS === "ios" ? 84 : 64,
  headerHeight: Platform.OS === "ios" ? 96 : 56,

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    timer: 56,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: { damping: 15, stiffness: 150 },
  },
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;
