import { StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { SessionType } from "@/types";

interface SandGradientProps {
  sessionType: SessionType;
  style?: ViewStyle;
}

const GRADIENT_COLORS: Record<SessionType, [string, string, ...string[]]> = {
  focus: ["#FF6B35", "#FF8C5A", "#FFA87A"],
  break: ["#34C759", "#5BD778", "#82E29B"],
  long_break: ["#5856D6", "#7D7AFF", "#A09EFF"],
};

export function SandGradient({ sessionType, style }: SandGradientProps) {
  return (
    <LinearGradient
      colors={GRADIENT_COLORS[sessionType]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
  },
});
