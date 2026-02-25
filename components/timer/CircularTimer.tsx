import { StyleSheet, Text, View } from "react-native";
import { ProgressRing } from "@/components/timer/ProgressRing";
import { formatSeconds } from "@/utils/formatTime";
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
  return (
    <View
      style={styles.container}
      accessibilityLabel={`${SESSION_LABELS[sessionType]} timer: ${formatSeconds(timeRemaining)} remaining`}
    >
      <ProgressRing progress={progress} sessionType={sessionType} />
      <View style={styles.inner}>
        <Text style={styles.sessionLabel}>{SESSION_LABELS[sessionType]}</Text>
        <Text style={styles.time}>{formatSeconds(timeRemaining)}</Text>
        <Text style={styles.status}>{isRunning ? "Running" : "Paused"}</Text>
      </View>
    </View>
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
    fontWeight: "500",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  time: {
    fontSize: Layout.fontSize.timer,
    fontWeight: "200",
    fontVariant: ["tabular-nums"],
    color: "#FFFFFF",
  },
  status: {
    fontSize: Layout.fontSize.xs,
    color: "#8E8E93",
    marginTop: 4,
  },
});
