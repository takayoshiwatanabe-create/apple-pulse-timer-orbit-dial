import { create } from "zustand";
import type { SessionType, TimerConfig } from "@/types";
import { DEFAULT_CONFIG } from "@/constants/Timer";

interface TimerStore {
  isRunning: boolean;
  currentSession: SessionType;
  timeRemaining: number;
  totalDuration: number;
  cycleCount: number;
  config: TimerConfig;
  currentSessionId: number | null;
  interruptionCount: number;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  switchSession: () => void;
  updateConfig: (config: Partial<TimerConfig>) => void;
  setTimeRemaining: (seconds: number) => void;
  setCurrentSessionId: (id: number | null) => void;
  incrementInterruptions: () => void;
}

function getDurationForSession(session: SessionType, config: TimerConfig): number {
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

  startTimer: () => set({ isRunning: true }),

  pauseTimer: () => {
    const state = get();
    set({
      isRunning: false,
      interruptionCount: state.interruptionCount + 1,
    });
  },

  resetTimer: () => {
    const state = get();
    const duration = getDurationForSession(state.currentSession, state.config);
    set({
      isRunning: false,
      timeRemaining: duration,
      totalDuration: duration,
      interruptionCount: 0,
      currentSessionId: null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.timeRemaining <= 0) return;
    set({ timeRemaining: state.timeRemaining - 1 });
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
    });
  },

  updateConfig: (partial) => {
    const state = get();
    const newConfig = { ...state.config, ...partial };
    const duration = getDurationForSession(state.currentSession, newConfig);
    set({
      config: newConfig,
      timeRemaining: duration,
      totalDuration: duration,
      isRunning: false,
    });
  },

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  incrementInterruptions: () =>
    set((state) => ({ interruptionCount: state.interruptionCount + 1 })),
}));
