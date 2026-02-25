import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useEffect } from "react";
import { ProgressRing } from "@/components/timer/ProgressRing";
import { formatSeconds } from "@/utils/formatTime";
import { useAppColors } from "@/hooks/useColorScheme";
import type { SessionType } from "@/types";
import { Layout } from "@/constants/Layout";

interface CircularTimerProps {
  timeRemaining: number;
  progress: number;
  sessionType: SessionType;
  isRunning: boolean;
}

const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Focus",
  break: "Break",
  long_break: "Long Break",
};

export function CircularTimer({
  timeRemaining,
  progress,
  sessionType,
  isRunning,
}: CircularTimerProps) {
  const colors = useAppColors();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: Layout.animation.fast });
    }
  }, [isRunning, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const sessionColor = colors[
    sessionType === "focus"
      ? "focusRing"
      : sessionType === "break"
        ? "breakRing"
        : "longBreakRing"
  ];

  return (
    <Animated.View
      style={[styles.container, pulseStyle]}
      accessibilityLabel={`${SESSION_LABELS[sessionType]} timer: ${formatSeconds(timeRemaining)} remaining`}
    >
      <ProgressRing progress={progress} sessionType={sessionType} />
      <View style={styles.inner}>
        <Text style={[styles.sessionLabel, { color: sessionColor }]}>
          {SESSION_LABELS[sessionType]}
        </Text>
        <Text style={[styles.time, { color: colors.text }]}>
          {formatSeconds(timeRemaining)}
        </Text>
        <Text style={[styles.status, { color: colors.textSecondary }]}>
          {isRunning ? "Running" : "Paused"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Layout.timerSize,
    height: Layout.timerSize,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  time: {
    fontSize: Layout.fontSize.timer,
    fontWeight: Layout.fontWeight.regular,
    fontVariant: ["tabular-nums"],
  },
  status: {
    fontSize: Layout.fontSize.xs,
    marginTop: 4,
  },
});
