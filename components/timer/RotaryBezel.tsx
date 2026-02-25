import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useCallback, useMemo, type ReactNode } from "react";
import Svg, { Circle, Line } from "react-native-svg";
import { useHaptic } from "@/hooks/useHaptic";
import { useAppColors } from "@/hooks/useColorScheme";
import { Layout } from "@/constants/Layout";

const TICK_COUNT = 60;
const MAJOR_TICK_INTERVAL = 5;
const STEP_ANGLE = (2 * Math.PI) / TICK_COUNT;
const DEAD_ZONE_RATIO = 0.4;
const SPRING_CONFIG = { damping: 15, stiffness: 150 };

interface RotaryBezelProps {
  size?: number;
  onRotate?: (deltaMinutes: number) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function RotaryBezel({
  size = Layout.bezelSize,
  onRotate,
  disabled = false,
  children,
}: RotaryBezelProps) {
  const haptic = useHaptic();
  const colors = useAppColors();
  const center = size / 2;
  const deadZoneRadius = center * DEAD_ZONE_RATIO;

  const previousAngle = useSharedValue(0);
  const accumulatedAngle = useSharedValue(0);
  const lastStepIndex = useSharedValue(0);
  const rotationDeg = useSharedValue(0);
  const bezelScale = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    haptic.selection();
  }, [haptic]);

  const emitStep = useCallback(
    (delta: number) => {
      onRotate?.(delta);
    },
    [onRotate]
  );

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(0)
    .onBegin((e) => {
      const dx = e.x - center;
      const dy = e.y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < deadZoneRadius) return;

      previousAngle.value = Math.atan2(dy, dx);
      accumulatedAngle.value = 0;
      lastStepIndex.value = 0;
      bezelScale.value = withSpring(1.02, SPRING_CONFIG);
    })
    .onUpdate((e) => {
      const dx = e.x - center;
      const dy = e.y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < deadZoneRadius) return;

      const currentAngle = Math.atan2(dy, dx);
      let delta = currentAngle - previousAngle.value;

      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      accumulatedAngle.value += delta;
      rotationDeg.value += (delta * 180) / Math.PI;
      previousAngle.value = currentAngle;

      const currentStep = Math.round(accumulatedAngle.value / STEP_ANGLE);
      if (currentStep !== lastStepIndex.value) {
        const stepDelta = currentStep - lastStepIndex.value;
        lastStepIndex.value = currentStep;
        runOnJS(triggerHaptic)();
        runOnJS(emitStep)(stepDelta);
      }
    })
    .onFinalize(() => {
      bezelScale.value = withSpring(1, SPRING_CONFIG);
    });

  const bezelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bezelScale.value },
      { rotate: `${rotationDeg.value}deg` },
    ],
  }));

  const ticks = useMemo(() => {
    const outerR = center - 4;
    const majorLen = 12;
    const minorLen = 6;

    return Array.from({ length: TICK_COUNT }, (_, i) => {
      const angle = (i / TICK_COUNT) * 2 * Math.PI - Math.PI / 2;
      const isMajor = i % MAJOR_TICK_INTERVAL === 0;
      const len = isMajor ? majorLen : minorLen;
      return {
        x1: center + outerR * Math.cos(angle),
        y1: center + outerR * Math.sin(angle),
        x2: center + (outerR - len) * Math.cos(angle),
        y2: center + (outerR - len) * Math.sin(angle),
        isMajor,
      };
    });
  }, [center]);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="adjustable"
      accessibilityLabel="Timer duration bezel"
      accessibilityHint="Swipe up or down to adjust timer duration"
      accessibilityActions={[
        { name: "increment", label: "Add one minute" },
        { name: "decrement", label: "Subtract one minute" },
      ]}
      onAccessibilityAction={(event) => {
        if (disabled) return;
        const delta = event.nativeEvent.actionName === "increment" ? 1 : -1;
        haptic.selection();
        onRotate?.(delta);
      }}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.gestureArea, { width: size, height: size }]}>
          <Animated.View
            style={[
              styles.tickLayer,
              bezelAnimatedStyle,
              disabled && styles.disabledBezel,
            ]}
          >
            <Svg width={size} height={size}>
              <Circle
                cx={center}
                cy={center}
                r={center - 2}
                stroke={colors.border}
                strokeWidth={1.5}
                fill="transparent"
              />
              {ticks.map((tick, i) => (
                <Line
                  key={i}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.isMajor ? colors.textSecondary : colors.disabled}
                  strokeWidth={tick.isMajor ? 2 : 1}
                  strokeLinecap="round"
                />
              ))}
            </Svg>
          </Animated.View>
          <View style={styles.childrenLayer}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  gestureArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  tickLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  childrenLayer: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBezel: {
    opacity: 0.4,
  },
});
