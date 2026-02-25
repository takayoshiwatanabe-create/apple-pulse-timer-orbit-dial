import { describe, it, expect } from "@jest/globals";
import {
  DEFAULT_CONFIG,
  TIMER_PRESETS,
  MIN_FOCUS_DURATION,
  MAX_FOCUS_DURATION,
  MIN_BREAK_DURATION,
  MAX_BREAK_DURATION,
} from "./Timer";

describe("DEFAULT_CONFIG", () => {
  it("has standard Pomodoro values", () => {
    expect(DEFAULT_CONFIG.name).toBe("Pomodoro");
    expect(DEFAULT_CONFIG.focusDuration).toBe(25);
    expect(DEFAULT_CONFIG.breakDuration).toBe(5);
    expect(DEFAULT_CONFIG.longBreakDuration).toBe(15);
    expect(DEFAULT_CONFIG.cyclesUntilLongBreak).toBe(4);
  });

  it("has an id of 1", () => {
    expect(DEFAULT_CONFIG.id).toBe(1);
  });
});

describe("TIMER_PRESETS", () => {
  it("contains 3 presets", () => {
    expect(TIMER_PRESETS).toHaveLength(3);
  });

  it("includes Pomodoro, Deep Work, and Quick Focus", () => {
    const names = TIMER_PRESETS.map((p) => p.name);
    expect(names).toEqual(["Pomodoro", "Deep Work", "Quick Focus"]);
  });

  it("has valid durations for all presets", () => {
    for (const preset of TIMER_PRESETS) {
      expect(preset.focusDuration).toBeGreaterThan(0);
      expect(preset.breakDuration).toBeGreaterThan(0);
      expect(preset.longBreakDuration).toBeGreaterThan(0);
      expect(preset.cyclesUntilLongBreak).toBeGreaterThan(0);
      expect(preset.focusDuration).toBeGreaterThan(preset.breakDuration);
    }
  });
});

describe("Duration bounds", () => {
  it("has valid focus duration range", () => {
    expect(MIN_FOCUS_DURATION).toBe(1);
    expect(MAX_FOCUS_DURATION).toBe(120);
    expect(MIN_FOCUS_DURATION).toBeLessThan(MAX_FOCUS_DURATION);
  });

  it("has valid break duration range", () => {
    expect(MIN_BREAK_DURATION).toBe(1);
    expect(MAX_BREAK_DURATION).toBe(60);
    expect(MIN_BREAK_DURATION).toBeLessThan(MAX_BREAK_DURATION);
  });

  it("all presets fall within bounds", () => {
    for (const preset of TIMER_PRESETS) {
      expect(preset.focusDuration).toBeGreaterThanOrEqual(MIN_FOCUS_DURATION);
      expect(preset.focusDuration).toBeLessThanOrEqual(MAX_FOCUS_DURATION);
      expect(preset.breakDuration).toBeGreaterThanOrEqual(MIN_BREAK_DURATION);
      expect(preset.breakDuration).toBeLessThanOrEqual(MAX_BREAK_DURATION);
    }
  });
});
