import { useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useStatsStore } from "@/stores/statsStore";
import {
  saveFocusSession,
  completeFocusSession,
} from "@/utils/database";
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
    currentSessionId,
    interruptionCount,
    startTimer: storeStart,
    pauseTimer: storePause,
    resetTimer: storeReset,
    tick,
    switchSession,
    setTimeRemaining,
    setCurrentSessionId,
  } = useTimerStore();

  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const recordSession = useStatsStore((s) => s.recordSession);

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
    if (!currentSessionId) {
      const id = await saveFocusSession({
        configId: config.id,
        startTime: new Date().toISOString(),
        sessionType: currentSession,
      });
      setCurrentSessionId(id);
    }

    notificationIdRef.current = await scheduleTimerNotification(
      currentSession,
      timeRemaining
    );

    storeStart();
  }, [currentSession, timeRemaining, config.id, currentSessionId, storeStart, setCurrentSessionId]);

  const pauseTimer = useCallback(async () => {
    storePause();
    await cancelNotification();
  }, [storePause, cancelNotification]);

  const resetTimer = useCallback(async () => {
    storeReset();
    clearTickInterval();
    await cancelNotification();
  }, [storeReset, clearTickInterval, cancelNotification]);

  const handleSessionComplete = useCallback(async () => {
    clearTickInterval();
    await cancelNotification();

    if (hapticEnabled) {
      notificationSuccess();
    }

    if (currentSessionId) {
      await completeFocusSession(currentSessionId, true, interruptionCount);
    }

    if (currentSession === "focus") {
      const focusMinutes = Math.round(totalDuration / 60);
      await recordSession(focusMinutes, true);
    }

    switchSession();
  }, [
    clearTickInterval,
    cancelNotification,
    hapticEnabled,
    currentSessionId,
    interruptionCount,
    currentSession,
    totalDuration,
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
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" && isRunning) {
        backgroundTimeRef.current = Date.now();
      } else if (nextState === "active" && backgroundTimeRef.current && isRunning) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        backgroundTimeRef.current = null;
        const newTime = Math.max(0, timeRemaining - elapsed);
        setTimeRemaining(newTime);
      }
    });

    return () => subscription.remove();
  }, [isRunning, timeRemaining, setTimeRemaining]);

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
