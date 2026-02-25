export interface DailyStats {
  id: number;
  date: string;
  totalFocusTime: number;
  sessionsCompleted: number;
  sessionsInterrupted: number;
  streakDays: number;
  createdAt: string;
}

export interface WeeklyOverview {
  days: DailyStats[];
  totalMinutes: number;
  totalSessions: number;
  averageMinutesPerDay: number;
}
