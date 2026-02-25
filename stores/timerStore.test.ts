import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { useTimerStore } from "./timerStore";
import { DEFAULT_CONFIG } from "@/constants/Timer";

jest.mock("@/utils/database", () => ({
  saveFocusSession: jest.fn().mockResolvedValue(42 as never),
  completeFocusSession: jest.fn().mockResolvedValue(undefined as never),
}));

const { saveFocusSession, completeFocusSession } =
  jest.requireMock<typeof import("@/utils/database")>("@/utils/database");

function resetStore() {
  useTimerStore.setState({
    isRunning: false,
    currentSession: "focus",
    timeRemaining: DEFAULT_CONFIG.focusDuration * 60,
    totalDuration: DEFAULT_CONFIG.focusDuration * 60,
    cycleCount: 0,
    config: DEFAULT_CONFIG,
    currentSessionId: null,
    interruptionCount: 0,
    startTime: null,
  });
}

describe("timerStore", () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts in focus session", () => {
      const state = useTimerStore.getState();
      expect(state.currentSession).toBe("focus");
    });

    it("is not running", () => {
      expect(useTimerStore.getState().isRunning).toBe(false);
    });

    it("has default Pomodoro time remaining (25 min)", () => {
      expect(useTimerStore.getState().timeRemaining).toBe(25 * 60);
    });

    it("has no interruptions", () => {
      expect(useTimerStore.getState().interruptionCount).toBe(0);
    });

    it("has cycleCount 0", () => {
      expect(useTimerStore.getState().cycleCount).toBe(0);
    });
  });

  describe("startTimer", () => {
    it("sets isRunning to true", async () => {
      await useTimerStore.getState().startTimer();
      expect(useTimerStore.getState().isRunning).toBe(true);
    });

    it("saves a session to database", async () => {
      await useTimerStore.getState().startTimer();
      expect(saveFocusSession).toHaveBeenCalledWith(
        expect.objectContaining({
          configId: DEFAULT_CONFIG.id,
          sessionType: "focus",
        })
      );
    });

    it("stores the session id", async () => {
      await useTimerStore.getState().startTimer();
      expect(useTimerStore.getState().currentSessionId).toBe(42);
    });

    it("does nothing if already running", async () => {
      await useTimerStore.getState().startTimer();
      jest.clearAllMocks();
      await useTimerStore.getState().startTimer();
      expect(saveFocusSession).not.toHaveBeenCalled();
    });
  });

  describe("pauseTimer", () => {
    it("sets isRunning to false", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();
      expect(useTimerStore.getState().isRunning).toBe(false);
    });

    it("increments interruption count", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();
      expect(useTimerStore.getState().interruptionCount).toBe(1);
    });

    it("does nothing if not running", () => {
      useTimerStore.getState().pauseTimer();
      expect(useTimerStore.getState().interruptionCount).toBe(0);
    });
  });

  describe("tick", () => {
    it("decrements timeRemaining by 1", async () => {
      await useTimerStore.getState().startTimer();
      const before = useTimerStore.getState().timeRemaining;
      useTimerStore.getState().tick();
      expect(useTimerStore.getState().timeRemaining).toBe(before - 1);
    });

    it("returns false when time remains", async () => {
      await useTimerStore.getState().startTimer();
      const done = useTimerStore.getState().tick();
      expect(done).toBe(false);
    });

    it("returns true when timer reaches 0", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.setState({ timeRemaining: 1 });
      const done = useTimerStore.getState().tick();
      expect(done).toBe(true);
      expect(useTimerStore.getState().timeRemaining).toBe(0);
    });

    it("does nothing when not running", () => {
      const before = useTimerStore.getState().timeRemaining;
      const result = useTimerStore.getState().tick();
      expect(result).toBe(false);
      expect(useTimerStore.getState().timeRemaining).toBe(before);
    });
  });

  describe("resetTimer", () => {
    it("resets to full duration", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.getState().tick();
      await useTimerStore.getState().resetTimer();
      expect(useTimerStore.getState().timeRemaining).toBe(25 * 60);
    });

    it("stops running", async () => {
      await useTimerStore.getState().startTimer();
      await useTimerStore.getState().resetTimer();
      expect(useTimerStore.getState().isRunning).toBe(false);
    });

    it("clears session id and interruptions", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();
      await useTimerStore.getState().resetTimer();
      expect(useTimerStore.getState().currentSessionId).toBeNull();
      expect(useTimerStore.getState().interruptionCount).toBe(0);
    });

    it("completes session as not completed in database", async () => {
      await useTimerStore.getState().startTimer();
      await useTimerStore.getState().resetTimer();
      expect(completeFocusSession).toHaveBeenCalledWith(42, false, 0);
    });
  });

  describe("completeSession", () => {
    it("marks session as completed in database", async () => {
      await useTimerStore.getState().startTimer();
      await useTimerStore.getState().completeSession();
      expect(completeFocusSession).toHaveBeenCalledWith(42, true, 0);
    });

    it("clears running state and session id", async () => {
      await useTimerStore.getState().startTimer();
      await useTimerStore.getState().completeSession();
      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.currentSessionId).toBeNull();
      expect(state.interruptionCount).toBe(0);
    });
  });

  describe("switchSession", () => {
    it("switches from focus to break", () => {
      useTimerStore.getState().switchSession();
      const state = useTimerStore.getState();
      expect(state.currentSession).toBe("break");
      expect(state.timeRemaining).toBe(5 * 60);
      expect(state.cycleCount).toBe(1);
    });

    it("switches from break back to focus", () => {
      useTimerStore.getState().switchSession(); // focus -> break
      useTimerStore.getState().switchSession(); // break -> focus
      const state = useTimerStore.getState();
      expect(state.currentSession).toBe("focus");
      expect(state.timeRemaining).toBe(25 * 60);
    });

    it("triggers long break after configured cycles", () => {
      // Default is 4 cycles until long break
      for (let i = 0; i < 4; i++) {
        // focus -> break (or long_break)
        useTimerStore.getState().switchSession();
        if (i < 3) {
          // break -> focus
          useTimerStore.getState().switchSession();
        }
      }
      const state = useTimerStore.getState();
      expect(state.currentSession).toBe("long_break");
      expect(state.timeRemaining).toBe(15 * 60);
    });

    it("resets isRunning and interruptionCount", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();
      useTimerStore.getState().switchSession();
      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.interruptionCount).toBe(0);
    });
  });

  describe("updateConfig", () => {
    it("updates config and recalculates duration", () => {
      useTimerStore.getState().updateConfig({ focusDuration: 50 });
      const state = useTimerStore.getState();
      expect(state.config.focusDuration).toBe(50);
      expect(state.timeRemaining).toBe(50 * 60);
      expect(state.totalDuration).toBe(50 * 60);
    });

    it("does not update while running", async () => {
      await useTimerStore.getState().startTimer();
      useTimerStore.getState().updateConfig({ focusDuration: 50 });
      expect(useTimerStore.getState().config.focusDuration).toBe(25);
    });

    it("preserves other config fields when updating partially", () => {
      useTimerStore.getState().updateConfig({ breakDuration: 10 });
      const state = useTimerStore.getState();
      expect(state.config.focusDuration).toBe(25);
      expect(state.config.breakDuration).toBe(10);
    });
  });

  describe("setTimeRemaining", () => {
    it("sets time to the given value", () => {
      useTimerStore.getState().setTimeRemaining(100);
      expect(useTimerStore.getState().timeRemaining).toBe(100);
    });

    it("clamps to 0 for negative values", () => {
      useTimerStore.getState().setTimeRemaining(-5);
      expect(useTimerStore.getState().timeRemaining).toBe(0);
    });
  });

  describe("incrementInterruptions", () => {
    it("increments interruption count", () => {
      useTimerStore.getState().incrementInterruptions();
      expect(useTimerStore.getState().interruptionCount).toBe(1);
      useTimerStore.getState().incrementInterruptions();
      expect(useTimerStore.getState().interruptionCount).toBe(2);
    });
  });
});
