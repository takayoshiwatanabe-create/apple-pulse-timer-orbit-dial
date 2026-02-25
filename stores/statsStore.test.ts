import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { useStatsStore } from "./statsStore";
import type { DailyStats } from "@/types";

const mockGetDailyStats = jest.fn();
const mockGetWeeklyStats = jest.fn();
const mockUpsertDailyStats = jest.fn();

jest.mock("@/utils/database", () => ({
  getDailyStats: (...args: unknown[]) => mockGetDailyStats(...args),
  getWeeklyStats: (...args: unknown[]) => mockGetWeeklyStats(...args),
  upsertDailyStats: (...args: unknown[]) => mockUpsertDailyStats(...args),
}));

jest.mock("@/utils/formatTime", () => ({
  getTodayDateString: () => "2026-02-25",
  getWeekStartDate: () => "2026-02-23",
}));

const makeDailyStats = (overrides: Partial<DailyStats> = {}): DailyStats => ({
  id: 1,
  date: "2026-02-25",
  totalFocusTime: 50,
  sessionsCompleted: 2,
  sessionsInterrupted: 0,
  streakDays: 3,
  createdAt: "2026-02-25T00:00:00Z",
  ...overrides,
});

function resetStore() {
  useStatsStore.setState({
    todayStats: null,
    weeklyStats: [],
    isLoading: false,
  });
}

describe("statsStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
    mockUpsertDailyStats.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("has no stats loaded", () => {
      const state = useStatsStore.getState();
      expect(state.todayStats).toBeNull();
      expect(state.weeklyStats).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("loadTodayStats", () => {
    it("loads today stats from database", async () => {
      const stats = makeDailyStats();
      mockGetDailyStats.mockResolvedValue(stats);
      await useStatsStore.getState().loadTodayStats();
      expect(useStatsStore.getState().todayStats).toEqual(stats);
      expect(mockGetDailyStats).toHaveBeenCalledWith("2026-02-25");
    });

    it("sets isLoading during fetch", async () => {
      mockGetDailyStats.mockResolvedValue(null);
      const promise = useStatsStore.getState().loadTodayStats();
      expect(useStatsStore.getState().isLoading).toBe(true);
      await promise;
      expect(useStatsStore.getState().isLoading).toBe(false);
    });
  });

  describe("loadWeeklyStats", () => {
    it("loads weekly stats from database", async () => {
      const weekStats = [
        makeDailyStats({ date: "2026-02-23", totalFocusTime: 25 }),
        makeDailyStats({ date: "2026-02-24", totalFocusTime: 50 }),
        makeDailyStats({ date: "2026-02-25", totalFocusTime: 30 }),
      ];
      mockGetWeeklyStats.mockResolvedValue(weekStats);
      await useStatsStore.getState().loadWeeklyStats();
      expect(useStatsStore.getState().weeklyStats).toEqual(weekStats);
      expect(mockGetWeeklyStats).toHaveBeenCalledWith("2026-02-23");
    });
  });

  describe("recordSession", () => {
    it("upserts daily stats and refreshes", async () => {
      const updatedStats = makeDailyStats({ totalFocusTime: 75 });
      mockUpsertDailyStats.mockResolvedValue(undefined);
      mockGetDailyStats.mockResolvedValue(updatedStats);

      await useStatsStore.getState().recordSession(25, true);

      expect(mockUpsertDailyStats).toHaveBeenCalledWith("2026-02-25", 25, true);
      expect(useStatsStore.getState().todayStats).toEqual(updatedStats);
    });

    it("records interrupted sessions", async () => {
      mockGetDailyStats.mockResolvedValue(
        makeDailyStats({ sessionsInterrupted: 1 })
      );

      await useStatsStore.getState().recordSession(10, false);

      expect(mockUpsertDailyStats).toHaveBeenCalledWith(
        "2026-02-25",
        10,
        false
      );
    });
  });

  describe("getCurrentStreak", () => {
    it("returns 0 when no stats loaded", () => {
      expect(useStatsStore.getState().getCurrentStreak()).toBe(0);
    });

    it("returns streak from today stats", () => {
      useStatsStore.setState({ todayStats: makeDailyStats({ streakDays: 7 }) });
      expect(useStatsStore.getState().getCurrentStreak()).toBe(7);
    });
  });

  describe("getWeeklyTotalMinutes", () => {
    it("returns 0 for empty weekly stats", () => {
      expect(useStatsStore.getState().getWeeklyTotalMinutes()).toBe(0);
    });

    it("sums focus time across the week", () => {
      useStatsStore.setState({
        weeklyStats: [
          makeDailyStats({ totalFocusTime: 25 }),
          makeDailyStats({ totalFocusTime: 50 }),
          makeDailyStats({ totalFocusTime: 30 }),
        ],
      });
      expect(useStatsStore.getState().getWeeklyTotalMinutes()).toBe(105);
    });
  });

  describe("getWeeklySessionCount", () => {
    it("returns 0 for empty weekly stats", () => {
      expect(useStatsStore.getState().getWeeklySessionCount()).toBe(0);
    });

    it("sums sessions across the week", () => {
      useStatsStore.setState({
        weeklyStats: [
          makeDailyStats({ sessionsCompleted: 2 }),
          makeDailyStats({ sessionsCompleted: 3 }),
          makeDailyStats({ sessionsCompleted: 1 }),
        ],
      });
      expect(useStatsStore.getState().getWeeklySessionCount()).toBe(6);
    });
  });

  describe("refreshAll", () => {
    it("loads both today and weekly stats", async () => {
      const todayStats = makeDailyStats();
      const weekStats = [makeDailyStats({ date: "2026-02-23" })];
      mockGetDailyStats.mockResolvedValue(todayStats);
      mockGetWeeklyStats.mockResolvedValue(weekStats);

      await useStatsStore.getState().refreshAll();

      expect(useStatsStore.getState().todayStats).toEqual(todayStats);
      expect(useStatsStore.getState().weeklyStats).toEqual(weekStats);
      expect(useStatsStore.getState().isLoading).toBe(false);
    });
  });
});
