import type { TimerConfig } from "@/types";

export const DEFAULT_CONFIG: TimerConfig = {
  id: 1,
  name: "Pomodoro",
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  cyclesUntilLongBreak: 4,
  createdAt: "",
};

export const TIMER_PRESETS: Pick<TimerConfig, "name" | "focusDuration" | "breakDuration" | "longBreakDuration" | "cyclesUntilLongBreak">[] = [
  {
    name: "Pomodoro",
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    cyclesUntilLongBreak: 4,
  },
  {
    name: "Deep Work",
    focusDuration: 50,
    breakDuration: 10,
    longBreakDuration: 30,
    cyclesUntilLongBreak: 2,
  },
  {
    name: "Quick Focus",
    focusDuration: 15,
    breakDuration: 3,
    longBreakDuration: 10,
    cyclesUntilLongBreak: 4,
  },
];

export const MIN_FOCUS_DURATION = 1;
export const MAX_FOCUS_DURATION = 120;
export const MIN_BREAK_DURATION = 1;
export const MAX_BREAK_DURATION = 60;
