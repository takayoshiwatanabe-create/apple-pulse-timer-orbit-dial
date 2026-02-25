export type SessionType = "focus" | "break" | "long_break";

export interface TimerConfig {
  id: number;
  name: string;
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  cyclesUntilLongBreak: number;
  createdAt: string;
}

export interface FocusSession {
  id: number;
  configId: number;
  startTime: string;
  endTime: string | null;
  sessionType: SessionType;
  completed: boolean;
  interruptionCount: number;
  createdAt: string;
}

export interface TimerState {
  isRunning: boolean;
  currentSession: SessionType;
  timeRemaining: number;
  totalDuration: number;
  cycleCount: number;
  config: TimerConfig;
}
