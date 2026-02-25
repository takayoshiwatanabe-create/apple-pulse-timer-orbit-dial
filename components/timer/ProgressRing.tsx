import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import type { SessionType } from "@/types";
import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number;
  sessionType: SessionType;
  size?: number;
  strokeWidth?: number;
}

const RING_COLORS: Record<SessionType, { start: string; end: string }> = {
  focus: { start: Colors.gradients.focusSand[0], end: Colors.gradients.focusSand[2] },
  break: { start: Colors.gradients.breakSand[0], end: Colors.gradients.breakSand[2] },
  long_break: { start: Colors.gradients.longBreakSand[0], end: Colors.gradients.longBreakSand[2] },
};

const TRACK_COLOR = "rgba(150, 150, 150, 0.15)";
const GLOW_OPACITY = 0.3;

export function ProgressRing({
  progress,
  sessionType,
  size = Layout.timerSize,
  strokeWidth = Layout.progressRingStroke,
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const glowStrokeWidth = strokeWidth + 6;

  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: Layout.animation.normal,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const glowAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const gradientColors = RING_COLORS[sessionType];
  const gradientId = `ring-gradient-${sessionType}`;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(progress * 100),
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors.start} />
            <Stop offset="100%" stopColor={gradientColors.end} />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Glow layer behind the progress arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={gradientColors.start}
          strokeWidth={glowStrokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={glowAnimatedProps}
          transform={`rotate(-90 ${center} ${center})`}
          opacity={GLOW_OPACITY}
        />

        {/* Main progress arc with gradient */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
