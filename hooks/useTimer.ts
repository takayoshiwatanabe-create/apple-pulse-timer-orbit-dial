import { useEffect, useRef, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useStatsStore } from "@/stores/statsStore";
import {
  scheduleTimerNotification,
  cancelScheduledNotification,
} from "@/utils/notifications";
import { notificationSuccess } from "@/utils/haptics";

export function useTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);

  const {
    isRunning,
    currentSession,
    timeRemaining,
    totalDuration,
    cycleCount,
    config,
    startTimer: storeStart,
    pauseTimer: storePause,
    resetTimer: storeReset,
    completeSession,
    tick,
    switchSession,
    setTimeRemaining,
  } = useTimerStore();

  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const recordSession = useStatsStore((s) => s.recordSession);

  const isRunningRef = useRef(isRunning);
  const timeRemainingRef = useRef(timeRemaining);
  isRunningRef.current = isRunning;
  timeRemainingRef.current = timeRemaining;

  const clearTickInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancelNotification = useCallback(async () => {
    if (notificationIdRef.current) {
      await cancelScheduledNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(async () => {
    const state = useTimerStore.getState();
    await storeStart();

    notificationIdRef.current = await scheduleTimerNotification(
      state.currentSession,
      state.timeRemaining
    );
  }, [storeStart]);

  const pauseTimer = useCallback(async () => {
    storePause();
    await cancelNotification();
  }, [storePause, cancelNotification]);

  const resetTimer = useCallback(async () => {
    await storeReset();
    clearTickInterval();
    await cancelNotification();
  }, [storeReset, clearTickInterval, cancelNotification]);

  const handleSessionComplete = useCallback(async () => {
    clearTickInterval();
    await cancelNotification();

    if (hapticEnabled) {
      notificationSuccess();
    }

    const state = useTimerStore.getState();
    await completeSession();

    if (state.currentSession === "focus") {
      const focusMinutes = Math.round(state.totalDuration / 60);
      await recordSession(focusMinutes, true);
    }

    switchSession();
  }, [
    clearTickInterval,
    cancelNotification,
    hapticEnabled,
    completeSession,
    recordSession,
    switchSession,
  ]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTickInterval();
    }
    return clearTickInterval;
  }, [isRunning, tick, clearTickInterval]);

  useEffect(() => {
    if (isRunning && timeRemaining <= 0) {
      handleSessionComplete();
    }
  }, [isRunning, timeRemaining, handleSessionComplete]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background" && isRunningRef.current) {
        backgroundTimeRef.current = Date.now();
      } else if (
        nextState === "active" &&
        backgroundTimeRef.current &&
        isRunningRef.current
      ) {
        const elapsed = Math.floor(
          (Date.now() - backgroundTimeRef.current) / 1000
        );
        backgroundTimeRef.current = null;
        const newTime = Math.max(0, timeRemainingRef.current - elapsed);
        setTimeRemaining(newTime);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [setTimeRemaining]);

  const progress = totalDuration > 0 ? 1 - timeRemaining / totalDuration : 0;

  return {
    isRunning,
    currentSession,
    timeRemaining,
    totalDuration,
    cycleCount,
    config,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    switchSession,
  };
}
