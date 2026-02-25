import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { SessionType } from "@/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL_TIMER = "timer";
const CHANNEL_REMINDER = "reminder";
const CHANNEL_STREAK = "streak";

// --- Permission Management ---

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// --- Android Channel Configuration ---

export async function configurePushNotifications(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Promise.all([
    Notifications.setNotificationChannelAsync(CHANNEL_TIMER, {
      name: "Timer Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    }),
    Notifications.setNotificationChannelAsync(CHANNEL_REMINDER, {
      name: "Break Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 150, 150],
    }),
    Notifications.setNotificationChannelAsync(CHANNEL_STREAK, {
      name: "Streak & Summary",
      importance: Notifications.AndroidImportance.LOW,
    }),
  ]);
}

// --- Timer Completion Notification ---

const SESSION_TITLES: Record<SessionType, string> = {
  focus: "Focus session complete!",
  break: "Break is over!",
  long_break: "Long break is over!",
};

const SESSION_BODIES: Record<SessionType, string> = {
  focus: "Great work! Time for a break.",
  break: "Ready to focus again?",
  long_break: "Feeling refreshed? Let's get back to it.",
};

export async function scheduleTimerNotification(
  sessionType: SessionType,
  seconds: number
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: SESSION_TITLES[sessionType],
      body: SESSION_BODIES[sessionType],
      ...(Platform.OS === "android" && { channelId: CHANNEL_TIMER }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, seconds),
    },
  });

  return id;
}

// --- Break Reminder ---

export async function scheduleBreakReminder(
  delaySeconds: number
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for a break",
      body: "You've been working hard. Take a short break to recharge.",
      ...(Platform.OS === "android" && { channelId: CHANNEL_REMINDER }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
    },
  });

  return id;
}

// --- Streak Notification ---

export async function scheduleStreakNotification(
  streakDays: number,
  delaySeconds: number
): Promise<string> {
  const title =
    streakDays >= 30
      ? `${streakDays}-day streak! Incredible!`
      : streakDays >= 7
        ? `${streakDays}-day streak! Keep it up!`
        : `${streakDays}-day streak!`;

  const body =
    streakDays >= 30
      ? "Your dedication is truly inspiring. Keep going!"
      : streakDays >= 7
        ? "Consistency is key. You're building a great habit."
        : "Great start! Come back tomorrow to keep your streak alive.";

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      ...(Platform.OS === "android" && { channelId: CHANNEL_STREAK }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
    },
  });

  return id;
}

// --- Daily Focus Summary ---

export async function scheduleDailySummary(
  totalMinutes: number,
  sessionsCompleted: number,
  delaySeconds: number
): Promise<string> {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const title = "Daily Focus Summary";
  const body =
    sessionsCompleted === 0
      ? "No sessions today. Start a focus session to build your streak!"
      : `You focused for ${timeStr} across ${sessionsCompleted} session${sessionsCompleted === 1 ? "" : "s"} today.`;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      ...(Platform.OS === "android" && { channelId: CHANNEL_STREAK }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
    },
  });

  return id;
}

// --- Cancellation ---

export async function cancelScheduledNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
