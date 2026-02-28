import { useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTimer } from "@/hooks/useTimer";
import { useFlipGesture } from "@/hooks/useFlipGesture";
import { useAppColors } from "@/hooks/useColorScheme";
import { useTimerStore } from "@/stores/timerStore";
import { CircularTimer } from "@/components/timer/CircularTimer";
import { RotaryBezel } from "@/components/timer/RotaryBezel";
import { HapticButton } from "@/components/ui/HapticButton";
import { AdBanner } from "@/components/ads/AdBanner";
import { Layout } from "@/constants/Layout";
import {
  MIN_FOCUS_DURATION,
  MAX_FOCUS_DURATION,
  MIN_BREAK_DURATION,
  MAX_BREAK_DURATION,
} from "@/constants/Timer";

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const {
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
  } = useTimer();

  const updateConfig = useTimerStore((s) => s.updateConfig);

  useFlipGesture({
    onFlipDown: () => {
      if (!isRunning) startTimer();
    },
    onFlipUp: () => {
      if (isRunning) pauseTimer();
    },
  });

  const handleBezelRotate = useCallback(
    (deltaMinutes: number) => {
      if (isRunning) return;

      if (currentSession === "focus") {
        const next = Math.max(
          MIN_FOCUS_DURATION,
          Math.min(MAX_FOCUS_DURATION, config.focusDuration + deltaMinutes)
        );
        updateConfig({ focusDuration: next });
      } else if (currentSession === "break") {
        const next = Math.max(
          MIN_BREAK_DURATION,
          Math.min(MAX_BREAK_DURATION, config.breakDuration + deltaMinutes)
        );
        updateConfig({ breakDuration: next });
      } else {
        const next = Math.max(
          MIN_BREAK_DURATION,
          Math.min(MAX_BREAK_DURATION, config.longBreakDuration + deltaMinutes)
        );
        updateConfig({ longBreakDuration: next });
      }
    },
    [isRunning, currentSession, config, updateConfig]
  );

  const handleStartPause = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, pauseTimer]);

  const cyclesUntilLongBreak = config.cyclesUntilLongBreak;
  const currentCycleInSet = cycleCount % cyclesUntilLongBreak;
  const hasTimerActivity = isRunning || timeRemaining !== totalDuration;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + Layout.spacing.md,
          paddingBottom: Layout.tabBarHeight + Layout.spacing.sm,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.configName, { color: colors.textSecondary }]}>
          {config.name}
        </Text>
        <View style={styles.cycleIndicator}>
          {Array.from({ length: cyclesUntilLongBreak }, (_, i) => (
            <View
              key={i}
              style={[
                styles.cycleDot,
                {
                  backgroundColor:
                    i < currentCycleInSet ? colors.tint : colors.disabled,
                },
              ]}
              accessibilityLabel={`Cycle ${i + 1} of ${cyclesUntilLongBreak}: ${i < currentCycleInSet ? "completed" : "remaining"}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.timerContainer}>
        <RotaryBezel onRotate={handleBezelRotate} disabled={isRunning}>
          <CircularTimer
            timeRemaining={timeRemaining}
            progress={progress}
            sessionType={currentSession}
            isRunning={isRunning}
          />
        </RotaryBezel>
      </View>

      <View style={styles.controls}>
        <HapticButton
          onPress={resetTimer}
          label="Reset"
          variant="ghost"
          disabled={!hasTimerActivity}
          accessibilityLabel="Reset timer"
        />
        <HapticButton
          onPress={handleStartPause}
          label={isRunning ? "Pause" : "Start"}
          variant="primary"
          style={styles.startButton}
          accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
        />
      </View>

      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        {isRunning
          ? "Flip device to pause"
          : "Rotate bezel to adjust \u2022 Flip to start"}
      </Text>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    gap: Layout.spacing.sm,
  },
  configName: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  cycleIndicator: {
    flexDirection: "row",
    gap: Layout.spacing.sm,
  },
  cycleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.lg,
  },
  startButton: {
    minWidth: 120,
  },
  hint: {
    fontSize: Layout.fontSize.xs,
    textAlign: "center",
  },
});
