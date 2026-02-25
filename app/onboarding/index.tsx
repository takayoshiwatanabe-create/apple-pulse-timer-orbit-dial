import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import Svg, { Circle, Path, Line, G, Rect } from "react-native-svg";
import { useAppColors } from "@/hooks/useColorScheme";
import { useHaptic } from "@/hooks/useHaptic";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  requestNotificationPermissions,
  configurePushNotifications,
} from "@/utils/notifications";
import { Layout } from "@/constants/Layout";
import { HapticButton } from "@/components/ui/HapticButton";

const { width: SCREEN_WIDTH } = Layout.window;

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: "welcome",
    title: "Apple Pulse Timer",
    description:
      "Deep focus, beautiful design.\nA timer crafted for how you actually work.",
  },
  {
    id: "bezel",
    title: "Rotary Bezel",
    description:
      "Drag around the dial to set your focus time.\nFeel each tick through haptic feedback.",
  },
  {
    id: "flip",
    title: "Flip to Focus",
    description:
      "Place your phone face-down to start the timer.\nFlip it back to pause — no taps needed.",
  },
  {
    id: "notifications",
    title: "Stay in the Loop",
    description:
      "Get notified when sessions end and breaks begin.\nNever miss a beat in your flow.",
  },
];

function WelcomeIllustration({ color, tint }: { color: string; tint: string }) {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Circle
        cx={90}
        cy={90}
        r={70}
        stroke={tint}
        strokeWidth={4}
        fill="none"
      />
      <Circle
        cx={90}
        cy={90}
        r={60}
        stroke={tint}
        strokeWidth={2}
        fill="none"
        opacity={0.3}
      />
      <Path
        d="M90 50 L90 90 L120 105"
        stroke={tint}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={90} cy={90} r={5} fill={tint} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 90 + 64 * Math.cos(angle);
        const y1 = 90 + 64 * Math.sin(angle);
        const x2 = 90 + 70 * Math.cos(angle);
        const y2 = 90 + 70 * Math.sin(angle);
        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={i % 3 === 0 ? 3 : 1.5}
            strokeLinecap="round"
            opacity={i % 3 === 0 ? 0.8 : 0.4}
          />
        );
      })}
    </Svg>
  );
}

function BezelIllustration({ color, tint }: { color: string; tint: string }) {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Circle
        cx={90}
        cy={90}
        r={75}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        opacity={0.2}
      />
      <Circle
        cx={90}
        cy={90}
        r={65}
        stroke={tint}
        strokeWidth={6}
        fill="none"
        strokeDasharray="12 6"
        strokeLinecap="round"
      />
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const isMajor = i % 5 === 0;
        const inner = isMajor ? 52 : 55;
        const outer = 60;
        return (
          <Line
            key={i}
            x1={90 + inner * Math.cos(angle)}
            y1={90 + inner * Math.sin(angle)}
            x2={90 + outer * Math.cos(angle)}
            y2={90 + outer * Math.sin(angle)}
            stroke={color}
            strokeWidth={isMajor ? 2 : 1}
            strokeLinecap="round"
            opacity={isMajor ? 0.6 : 0.25}
          />
        );
      })}
      <G opacity={0.6}>
        <Path
          d="M145 55 C155 45, 165 50, 158 62"
          stroke={tint}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M158 62 L160 55 L153 59"
          stroke={tint}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Circle cx={90} cy={90} r={6} fill={tint} opacity={0.8} />
    </Svg>
  );
}

function FlipIllustration({ color, tint }: { color: string; tint: string }) {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <G opacity={0.35}>
        <Rect
          x={55}
          y={15}
          width={70}
          height={120}
          rx={12}
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
        <Rect
          x={80}
          y={120}
          width={20}
          height={3}
          rx={1.5}
          fill={color}
          opacity={0.5}
        />
      </G>
      <G>
        <Path
          d="M75 90 C75 120, 90 140, 90 140 C90 140, 105 120, 105 90"
          stroke={tint}
          strokeWidth={2}
          fill="none"
          strokeDasharray="4 4"
          opacity={0.5}
        />
        <Path
          d="M85 125 L90 135 L95 125"
          stroke={tint}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
      </G>
      <G transform="translate(90, 155) rotate(180) translate(-90, -25)">
        <Rect
          x={55}
          y={15}
          width={70}
          height={120}
          rx={12}
          stroke={tint}
          strokeWidth={2.5}
          fill="none"
        />
        <Circle cx={90} cy={60} r={20} stroke={tint} strokeWidth={2} fill="none" />
        <Path
          d="M90 48 L90 60 L98 66"
          stroke={tint}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}

function NotificationIllustration({
  color,
  tint,
}: {
  color: string;
  tint: string;
}) {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Path
        d="M90 35 C70 35, 55 50, 55 70 L55 100 L45 115 L135 115 L125 100 L125 70 C125 50, 110 35, 90 35Z"
        stroke={tint}
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M75 115 C75 128, 82 138, 90 138 C98 138, 105 128, 105 115"
        stroke={tint}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <Line
        x1={90}
        y1={20}
        x2={90}
        y2={35}
        stroke={tint}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <G opacity={0.4}>
        <Path
          d="M40 55 C35 55, 30 60, 30 65"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M33 45 C25 45, 18 55, 18 65"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M140 55 C145 55, 150 60, 150 65"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M147 45 C155 45, 162 55, 162 65"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

const ILLUSTRATIONS: Record<
  string,
  (props: { color: string; tint: string }) => React.JSX.Element
> = {
  welcome: WelcomeIllustration,
  bezel: BezelIllustration,
  flip: FlipIllustration,
  notifications: NotificationIllustration,
};

export default function OnboardingScreen() {
  const colors = useAppColors();
  const haptic = useHaptic();
  const router = useRouter();
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingPage>>(null);
  const buttonScale = useSharedValue(1);

  const isLastPage = currentIndex === PAGES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNext = useCallback(() => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleNotificationPermission = useCallback(async () => {
    await configurePushNotifications();
    await requestNotificationPermissions();
  }, []);

  const completeOnboarding = useCallback(async () => {
    haptic.success();
    await updateSettings({ onboardingCompleted: true });
    router.replace("/(tabs)");
  }, [haptic, updateSettings, router]);

  const handlePrimaryAction = useCallback(async () => {
    if (isLastPage) {
      await handleNotificationPermission();
      await completeOnboarding();
    } else {
      goToNext();
    }
  }, [isLastPage, handleNotificationPermission, completeOnboarding, goToNext]);

  const handleSkip = useCallback(async () => {
    haptic.light();
    await updateSettings({ onboardingCompleted: true });
    router.replace("/(tabs)");
  }, [haptic, updateSettings, router]);

  const skipButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingPage>) => {
      const Illustration = ILLUSTRATIONS[item.id];
      return (
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.illustrationContainer}
          >
            {Illustration != null && (
              <Illustration color={colors.textSecondary} tint={colors.tint} />
            )}
          </Animated.View>

          <View style={styles.textContainer}>
            <Animated.Text
              entering={FadeInUp.delay(200).duration(500)}
              style={[styles.title, { color: colors.text }]}
            >
              {item.title}
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(350).duration(500)}
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {item.description}
            </Animated.Text>
          </View>
        </View>
      );
    },
    [colors]
  );

  const keyExtractor = useCallback((item: OnboardingPage) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipContainer}>
        {!isLastPage && (
          <Animated.View style={skipButtonStyle}>
            <Pressable
              onPress={handleSkip}
              onPressIn={() => {
                buttonScale.value = withSpring(0.95, {
                  damping: 15,
                  stiffness: 300,
                });
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1, {
                  damping: 15,
                  stiffness: 300,
                });
              }}
              hitSlop={Layout.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                Skip
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={styles.footer}
      >
        <View style={styles.pagination}>
          {PAGES.map((page, index) => (
            <Animated.View
              key={page.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.tint : colors.disabled,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <HapticButton
          onPress={handlePrimaryAction}
          label={isLastPage ? "Enable & Get Started" : "Continue"}
          variant="primary"
          style={styles.primaryButton}
          accessibilityLabel={
            isLastPage
              ? "Enable notifications and start using the app"
              : "Go to next page"
          }
        />

        {isLastPage && (
          <Pressable
            onPress={completeOnboarding}
            hitSlop={Layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Skip notifications and start using the app"
          >
            <Text style={[styles.secondaryAction, { color: colors.textSecondary }]}>
              Maybe Later
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: Layout.spacing.xxl + Layout.spacing.md,
    right: Layout.spacing.lg,
    zIndex: 10,
  },
  skipText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Layout.spacing.xl,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.xxl,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    textAlign: "center",
    marginBottom: Layout.spacing.md,
  },
  description: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.regular,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: Layout.spacing.xxl + Layout.spacing.md,
    alignItems: "center",
    gap: Layout.spacing.lg,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: Layout.borderRadius.full,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: Layout.spacing.md,
  },
  secondaryAction: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
    paddingVertical: Layout.spacing.xs,
  },
});
