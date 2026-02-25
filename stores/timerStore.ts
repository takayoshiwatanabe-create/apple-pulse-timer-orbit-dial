import { create } from "zustand";
import type { SessionType, TimerConfig } from "@/types";
import { DEFAULT_CONFIG } from "@/constants/Timer";
import {
  saveFocusSession,
  completeFocusSession,
} from "@/utils/database";

interface TimerStore {
  isRunning: boolean;
  currentSession: SessionType;
  timeRemaining: number;
  totalDuration: number;
  cycleCount: number;
  config: TimerConfig;
  currentSessionId: number | null;
  interruptionCount: number;
  startTime: string | null;

  startTimer: () => Promise<void>;
  pauseTimer: () => void;
  resetTimer: () => Promise<void>;
  tick: () => boolean;
  completeSession: () => Promise<void>;
  switchSession: () => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
  setTimeRemaining: (seconds: number) => void;
  incrementInterruptions: () => void;
}

function getDurationForSession(
  session: SessionType,
  config: TimerConfig
): number {
  switch (session) {
    case "focus":
      return config.focusDuration * 60;
    case "break":
      return config.breakDuration * 60;
    case "long_break":
      return config.longBreakDuration * 60;
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  currentSession: "focus",
  timeRemaining: DEFAULT_CONFIG.focusDuration * 60,
  totalDuration: DEFAULT_CONFIG.focusDuration * 60,
  cycleCount: 0,
  config: DEFAULT_CONFIG,
  currentSessionId: null,
  interruptionCount: 0,
  startTime: null,

  startTimer: async () => {
    const state = get();
    if (state.isRunning) return;

    let sessionId = state.currentSessionId;
    if (sessionId === null) {
      const now = new Date().toISOString();
      sessionId = await saveFocusSession({
        configId: state.config.id,
        startTime: now,
        sessionType: state.currentSession,
      });
      set({ currentSessionId: sessionId, startTime: now });
    }

    set({ isRunning: true });
  },

  pauseTimer: () => {
    const state = get();
    if (!state.isRunning) return;
    set({
      isRunning: false,
      interruptionCount: state.interruptionCount + 1,
    });
  },

  resetTimer: async () => {
    const state = get();
    if (state.currentSessionId !== null) {
      await completeFocusSession(
        state.currentSessionId,
        false,
        state.interruptionCount
      );
    }
    const duration = getDurationForSession(state.currentSession, state.config);
    set({
      isRunning: false,
      timeRemaining: duration,
      totalDuration: duration,
      interruptionCount: 0,
      currentSessionId: null,
      startTime: null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.timeRemaining <= 0) return false;

    const next = state.timeRemaining - 1;
    set({ timeRemaining: next });
    return next <= 0;
  },

  completeSession: async () => {
    const state = get();
    if (state.currentSessionId !== null) {
      await completeFocusSession(
        state.currentSessionId,
        true,
        state.interruptionCount
      );
    }
    set({
      isRunning: false,
      currentSessionId: null,
      startTime: null,
      interruptionCount: 0,
    });
  },

  switchSession: () => {
    const state = get();
    let nextSession: SessionType;
    let nextCycle = state.cycleCount;

    if (state.currentSession === "focus") {
      nextCycle = state.cycleCount + 1;
      nextSession =
        nextCycle % state.config.cyclesUntilLongBreak === 0
          ? "long_break"
          : "break";
    } else {
      nextSession = "focus";
    }

    const duration = getDurationForSession(nextSession, state.config);
    set({
      currentSession: nextSession,
      timeRemaining: duration,
      totalDuration: duration,
      cycleCount: nextCycle,
      isRunning: false,
      interruptionCount: 0,
      currentSessionId: null,
      startTime: null,
    });
  },

  updateConfig: (partial) => {
    const state = get();
    if (state.isRunning) return;
    const newConfig = { ...state.config, ...partial };
    const duration = getDurationForSession(state.currentSession, newConfig);
    set({
      config: newConfig,
      timeRemaining: duration,
      totalDuration: duration,
    });
  },

  setTimeRemaining: (seconds) => set({ timeRemaining: Math.max(0, seconds) }),

  incrementInterruptions: () =>
    set((state) => ({ interruptionCount: state.interruptionCount + 1 })),
}));
