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
  recordSession: (focusMinutes: number, completed: boolean) => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set) => ({
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

  recordSession: async (focusMinutes, completed) => {
    const today = getTodayDateString();
    await upsertDailyStats(today, focusMinutes, completed);
    const stats = await getDailyStats(today);
    set({ todayStats: stats });
  },
}));
