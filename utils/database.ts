import * as SQLite from "expo-sqlite";
import type { TimerConfig, FocusSession, UserSettings, DailyStats, SessionType } from "@/types";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("pulse_timer.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS timer_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      focus_duration INTEGER NOT NULL,
      break_duration INTEGER NOT NULL,
      long_break_duration INTEGER DEFAULT 15,
      cycles_until_long_break INTEGER DEFAULT 4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_id INTEGER REFERENCES timer_configs(id),
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      session_type TEXT CHECK(session_type IN ('focus', 'break', 'long_break')),
      completed BOOLEAN DEFAULT FALSE,
      interruption_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY,
      haptic_enabled BOOLEAN DEFAULT 1,
      sound_enabled BOOLEAN DEFAULT 1,
      focus_mode_sync BOOLEAN DEFAULT 0,
      theme TEXT DEFAULT 'auto',
      premium_active BOOLEAN DEFAULT 0,
      onboarding_completed BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      total_focus_time INTEGER DEFAULT 0,
      sessions_completed INTEGER DEFAULT 0,
      sessions_interrupted INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO timer_configs (id, name, focus_duration, break_duration, long_break_duration, cycles_until_long_break)
    VALUES (1, 'Pomodoro', 25, 5, 15, 4);

    INSERT OR IGNORE INTO user_settings (id) VALUES (1);
  `);
}

export async function getTimerConfigs(): Promise<TimerConfig[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: number;
    name: string;
    focus_duration: number;
    break_duration: number;
    long_break_duration: number;
    cycles_until_long_break: number;
    created_at: string;
  }>("SELECT * FROM timer_configs ORDER BY id");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    focusDuration: row.focus_duration,
    breakDuration: row.break_duration,
    longBreakDuration: row.long_break_duration,
    cyclesUntilLongBreak: row.cycles_until_long_break,
    createdAt: row.created_at,
  }));
}

export async function saveTimerConfig(
  config: Omit<TimerConfig, "id" | "createdAt">
): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO timer_configs (name, focus_duration, break_duration, long_break_duration, cycles_until_long_break)
     VALUES (?, ?, ?, ?, ?)`,
    config.name,
    config.focusDuration,
    config.breakDuration,
    config.longBreakDuration,
    config.cyclesUntilLongBreak
  );
  return result.lastInsertRowId;
}

export async function saveFocusSession(
  session: Pick<FocusSession, "configId" | "startTime" | "sessionType">
): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO focus_sessions (config_id, start_time, session_type)
     VALUES (?, ?, ?)`,
    session.configId,
    session.startTime,
    session.sessionType
  );
  return result.lastInsertRowId;
}

export async function completeFocusSession(
  sessionId: number,
  completed: boolean,
  interruptionCount: number
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE focus_sessions SET end_time = datetime('now'), completed = ?, interruption_count = ? WHERE id = ?`,
    completed ? 1 : 0,
    interruptionCount,
    sessionId
  );
}

export async function getUserSettings(): Promise<UserSettings> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    id: number;
    haptic_enabled: number;
    sound_enabled: number;
    focus_mode_sync: number;
    theme: string;
    premium_active: number;
    onboarding_completed: number;
  }>("SELECT * FROM user_settings WHERE id = 1");

  if (!row) {
    return {
      id: 1,
      hapticEnabled: true,
      soundEnabled: true,
      focusModeSync: false,
      theme: "auto",
      premiumActive: false,
      onboardingCompleted: false,
    };
  }

  return {
    id: row.id,
    hapticEnabled: Boolean(row.haptic_enabled),
    soundEnabled: Boolean(row.sound_enabled),
    focusModeSync: Boolean(row.focus_mode_sync),
    theme: row.theme as UserSettings["theme"],
    premiumActive: Boolean(row.premium_active),
    onboardingCompleted: Boolean(row.onboarding_completed),
  };
}

export async function updateUserSettings(
  settings: Partial<Omit<UserSettings, "id">>
): Promise<void> {
  const database = await getDatabase();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (settings.hapticEnabled !== undefined) {
    updates.push("haptic_enabled = ?");
    values.push(settings.hapticEnabled ? 1 : 0);
  }
  if (settings.soundEnabled !== undefined) {
    updates.push("sound_enabled = ?");
    values.push(settings.soundEnabled ? 1 : 0);
  }
  if (settings.focusModeSync !== undefined) {
    updates.push("focus_mode_sync = ?");
    values.push(settings.focusModeSync ? 1 : 0);
  }
  if (settings.theme !== undefined) {
    updates.push("theme = ?");
    values.push(settings.theme);
  }
  if (settings.premiumActive !== undefined) {
    updates.push("premium_active = ?");
    values.push(settings.premiumActive ? 1 : 0);
  }
  if (settings.onboardingCompleted !== undefined) {
    updates.push("onboarding_completed = ?");
    values.push(settings.onboardingCompleted ? 1 : 0);
  }

  if (updates.length > 0) {
    await database.runAsync(
      `UPDATE user_settings SET ${updates.join(", ")} WHERE id = 1`,
      ...values
    );
  }
}

export async function getDailyStats(date: string): Promise<DailyStats | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    id: number;
    date: string;
    total_focus_time: number;
    sessions_completed: number;
    sessions_interrupted: number;
    streak_days: number;
    created_at: string;
  }>("SELECT * FROM daily_stats WHERE date = ?", date);

  if (!row) return null;

  return {
    id: row.id,
    date: row.date,
    totalFocusTime: row.total_focus_time,
    sessionsCompleted: row.sessions_completed,
    sessionsInterrupted: row.sessions_interrupted,
    streakDays: row.streak_days,
    createdAt: row.created_at,
  };
}

export async function getWeeklyStats(startDate: string): Promise<DailyStats[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: number;
    date: string;
    total_focus_time: number;
    sessions_completed: number;
    sessions_interrupted: number;
    streak_days: number;
    created_at: string;
  }>(
    "SELECT * FROM daily_stats WHERE date >= ? ORDER BY date ASC LIMIT 7",
    startDate
  );

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    totalFocusTime: row.total_focus_time,
    sessionsCompleted: row.sessions_completed,
    sessionsInterrupted: row.sessions_interrupted,
    streakDays: row.streak_days,
    createdAt: row.created_at,
  }));
}

export async function upsertDailyStats(
  date: string,
  focusMinutes: number,
  completed: boolean
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO daily_stats (date, total_focus_time, sessions_completed, sessions_interrupted)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       total_focus_time = total_focus_time + excluded.total_focus_time,
       sessions_completed = sessions_completed + excluded.sessions_completed,
       sessions_interrupted = sessions_interrupted + excluded.sessions_interrupted`,
    date,
    focusMinutes,
    completed ? 1 : 0,
    completed ? 0 : 1
  );
}
