/* eslint-disable no-undef */

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native").View;
  return {
    GestureDetector: View,
    Gesture: {
      Pan: () => ({
        enabled: () => ({
          minDistance: () => ({
            onBegin: () => ({
              onUpdate: () => ({
                onFinalize: () => ({}),
              }),
            }),
          }),
        }),
      }),
    },
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    ScrollView: require("react-native").ScrollView,
    FlatList: require("react-native").FlatList,
    TouchableOpacity: require("react-native").TouchableOpacity,
  };
});

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { HIGH: 4, DEFAULT: 3, LOW: 2 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 1 },
}));

// Mock expo-sensors
jest.mock("expo-sensors", () => ({
  DeviceMotion: {
    isAvailableAsync: jest.fn().mockResolvedValue(false),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    setUpdateInterval: jest.fn(),
  },
}));

// Mock expo-sqlite
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn(),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
    closeAsync: jest.fn(),
  }),
}));

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const View = require("react-native").View;
  return { LinearGradient: View };
});

// Mock react-native-svg
jest.mock("react-native-svg", () => {
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Circle: View,
    Line: View,
    Defs: View,
    LinearGradient: View,
    Stop: View,
    Rect: View,
    Path: View,
    G: View,
  };
});
