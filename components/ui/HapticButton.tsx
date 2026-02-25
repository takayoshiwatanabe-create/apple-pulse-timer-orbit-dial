import {
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { ReactNode } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { useAppColors } from "@/hooks/useColorScheme";
import { Layout } from "@/constants/Layout";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

type ButtonVariant = "primary" | "secondary" | "ghost";

interface HapticButtonProps {
  onPress: () => void;
  label?: string;
  children?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
}

export function HapticButton({
  onPress,
  label,
  children,
  style,
  textStyle,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
}: HapticButtonProps) {
  const scale = useSharedValue(1);
  const haptic = useHaptic();
  const colors = useAppColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    if (variant === "primary") {
      haptic.medium();
    } else if (variant === "secondary") {
      haptic.light();
    } else {
      haptic.selection();
    }
    onPress();
  };

  const variantContainerStyle = getVariantContainerStyle(variant, colors);
  const variantTextColor = getVariantTextColor(variant, colors);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        variantContainerStyle,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
    >
      {children}
      {label != null && (
        <Text
          style={[
            styles.text,
            { color: variantTextColor },
            disabled && { color: colors.disabled },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

function getVariantContainerStyle(
  variant: ButtonVariant,
  colors: ReturnType<typeof useAppColors>
): ViewStyle {
  switch (variant) {
    case "primary":
      return { backgroundColor: colors.tint };
    case "secondary":
      return {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.tint,
      };
    case "ghost":
      return { backgroundColor: "transparent" };
  }
}

function getVariantTextColor(
  variant: ButtonVariant,
  colors: ReturnType<typeof useAppColors>
): string {
  switch (variant) {
    case "primary":
      return "#FFFFFF";
    case "secondary":
    case "ghost":
      return colors.tint;
  }
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Layout.spacing.md - 2,
    paddingHorizontal: Layout.spacing.lg + 4,
    borderRadius: Layout.borderRadius.lg - 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Layout.spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
  },
});
