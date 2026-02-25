import { create } from "zustand";
import type { DailyStats } from "@/types";
import {
  getDailyStats,
  getWeeklyStats,
  upsertDailyStats,
} from "@/utils/database";
import { getTodayDateString, getWeekStartDate } from "@/utils/formatTime";

interface StatsStore {
  todayStats: DailyStats | null;
  weeklyStats: DailyStats[];
  isLoading: boolean;

  loadTodayStats: () => Promise<void>;
  loadWeeklyStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
  recordSession: (focusMinutes: number, completed: boolean) => Promise<void>;
  getCurrentStreak: () => number;
  getWeeklyTotalMinutes: () => number;
  getWeeklySessionCount: () => number;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  todayStats: null,
  weeklyStats: [],
  isLoading: false,

  loadTodayStats: async () => {
    set({ isLoading: true });
    const today = getTodayDateString();
    const stats = await getDailyStats(today);
    set({ todayStats: stats, isLoading: false });
  },

  loadWeeklyStats: async () => {
    set({ isLoading: true });
    const weekStart = getWeekStartDate();
    const stats = await getWeeklyStats(weekStart);
    set({ weeklyStats: stats, isLoading: false });
  },

  refreshAll: async () => {
    set({ isLoading: true });
    const today = getTodayDateString();
    const weekStart = getWeekStartDate();
    const [todayStats, weeklyStats] = await Promise.all([
      getDailyStats(today),
      getWeeklyStats(weekStart),
    ]);
    set({ todayStats, weeklyStats, isLoading: false });
  },

  recordSession: async (focusMinutes, completed) => {
    const today = getTodayDateString();
    await upsertDailyStats(today, focusMinutes, completed);
    const stats = await getDailyStats(today);
    set({ todayStats: stats });
  },

  getCurrentStreak: () => {
    const { todayStats } = get();
    return todayStats?.streakDays ?? 0;
  },

  getWeeklyTotalMinutes: () => {
    const { weeklyStats } = get();
    return weeklyStats.reduce((sum, day) => sum + day.totalFocusTime, 0);
  },

  getWeeklySessionCount: () => {
    const { weeklyStats } = get();
    return weeklyStats.reduce((sum, day) => sum + day.sessionsCompleted, 0);
  },
}));
