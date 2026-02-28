import { useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAppColors } from "@/hooks/useColorScheme";
import { AdBanner } from "@/components/ads/AdBanner";
import { useHaptic } from "@/hooks/useHaptic";
import { Layout } from "@/constants/Layout";
import type { ThemeMode } from "@/types";

type IconProps = { color: string; size: number };

function HapticIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 16L5 13L2 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 7L12 4L15 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 17L12 20L15 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 16L19 13L22 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SoundIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PaletteIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path d="M12 2V22" stroke={color} strokeWidth={2} />
      <Path
        d="M12 2C14.5 2 19 5.5 19 12C19 18.5 14.5 22 12 22"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.15}
      />
    </Svg>
  );
}

function FocusIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M17.5 12H22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M2 12H6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 6.5V2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 22V17.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function CrownIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 20H22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 17L2 7L7.5 10L12 4L16.5 10L22 7L20 17H4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right: React.ReactNode;
  onPress?: () => void; // Added for tappable rows
}

function SettingRow({ icon, title, subtitle, right, onPress }: SettingRowProps) {
  const colors = useAppColors();
  const content = (
    <View
      style={[styles.row, { borderBottomColor: colors.separator }]}
      accessibilityRole={onPress ? "button" : "none"}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
          {subtitle != null && (
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rowRight}>{right}</View>
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const haptic = useHaptic();

  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const focusModeSync = useSettingsStore((s) => s.focusModeSync);
  const theme = useSettingsStore((s) => s.theme);
  const premiumActive = useSettingsStore((s) => s.premiumActive);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleToggleHaptic = useCallback(
    (value: boolean) => {
      updateSettings({ hapticEnabled: value });
    },
    [updateSettings],
  );

  const handleToggleSound = useCallback(
    (value: boolean) => {
      haptic.selection();
      updateSettings({ soundEnabled: value });
    },
    [haptic, updateSettings],
  );

  const handleToggleFocusMode = useCallback(
    (value: boolean) => {
      haptic.selection();
      updateSettings({ focusModeSync: value });
    },
    [haptic, updateSettings],
  );

  const handleThemeChange = useCallback(
    (newTheme: ThemeMode) => {
      if (newTheme === theme) return;
      haptic.selection();
      updateSettings({ theme: newTheme });
    },
    [haptic, theme, updateSettings],
  );

  const handleUpgradePress = useCallback(() => {
    haptic.medium();
    // TODO: Implement StoreKit/IAP for premium features
    Alert.alert(
      "Premium Features",
      "Unlock advanced timer configurations, custom themes, and more! (In-App Purchase coming soon)"
    );
  }, [haptic]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Layout.spacing.lg,
          paddingBottom: Layout.tabBarHeight + Layout.spacing.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>

      {/* General */}
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        General
      </Text>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface },
          Layout.shadow.sm,
        ]}
      >
        <SettingRow
          icon={<HapticIcon color={colors.tint} size={20} />}
          title="Haptics"
          subtitle="Vibration feedback for interactions"
          right={
            <Switch
              value={hapticEnabled}
              onValueChange={handleToggleHaptic}
              trackColor={{ false: colors.disabled, true: colors.tint }}
              thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
              accessibilityLabel="Toggle haptic feedback"
            />
          }
        />
        <SettingRow
          icon={<SoundIcon color={colors.tint} size={20} />}
          title="Sound"
          subtitle="Audio alerts for timer events"
          right={
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: colors.disabled, true: colors.tint }}
              thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
              accessibilityLabel="Toggle sound"
            />
          }
        />
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        Appearance
      </Text>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface },
          Layout.shadow.sm,
        ]}
      >
        <SettingRow
          icon={<PaletteIcon color={colors.tint} size={20} />}
          title="Theme"
          right={
            <View style={styles.themeSelector}>
              {THEME_OPTIONS.map((option) => {
                const isActive = theme === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleThemeChange(option.value)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isActive
                          ? colors.tint
                          : colors.surfaceElevated,
                        borderColor: isActive
                          ? colors.tint
                          : colors.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`${option.label} theme`}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        { color: isActive ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          }
        />
      </View>

      {/* Integration */}
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        Integration
      </Text>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface },
          Layout.shadow.sm,
        ]}
      >
        <SettingRow
          icon={<FocusIcon color={colors.tint} size={20} />}
          title="Focus Mode"
          subtitle={
            Platform.OS === "ios"
              ? "Sync with iOS Focus Mode"
              : "Sync with Do Not Disturb"
          }
          right={
            <Switch
              value={focusModeSync}
              onValueChange={handleToggleFocusMode}
              trackColor={{ false: colors.disabled, true: colors.tint }}
              thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
              accessibilityLabel="Toggle focus mode sync"
            />
          }
        />
      </View>

      {/* Premium */}
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        Subscription
      </Text>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface },
          Layout.shadow.sm,
        ]}
      >
        <SettingRow
          icon={<CrownIcon color={colors.premiumAccent} size={20} />}
          title="Premium"
          subtitle={premiumActive ? "Active" : "Unlock all features"}
          onPress={!premiumActive ? handleUpgradePress : undefined}
          right={
            premiumActive ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.premiumAccent },
                ]}
                accessibilityLabel="Premium is active"
              >
                <Text style={styles.badgeText}>Active</Text>
              </View>
            ) : (
              <Pressable
                onPress={handleUpgradePress}
                style={[
                  styles.upgradeButton,
                  { backgroundColor: colors.premiumAccent },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to premium"
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </Pressable>
            )
          }
        />
      </View>

      <Text style={[styles.versionText, { color: colors.textTertiary }]}>
        Apple Pulse Timer v1.0.0
      </Text>

      <AdBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.spacing.md,
  },
  screenTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    marginBottom: Layout.spacing.lg,
  },
  sectionHeader: {
    fontSize: Layout.fontSize.xs,
    fontWeight: Layout.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
    marginLeft: Layout.spacing.xs,
  },
  section: {
    borderRadius: Layout.borderRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    minHeight: Layout.minTouchTarget,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.md - 4,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  rowSubtitle: {
    fontSize: Layout.fontSize.xs,
    marginTop: 2,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  themeSelector: {
    flexDirection: "row",
    gap: Layout.spacing.xs,
  },
  themeOption: {
    paddingVertical: Layout.spacing.xs + 2,
    paddingHorizontal: Layout.spacing.md - 4,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
  badge: {
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md - 4,
    borderRadius: Layout.borderRadius.full,
  },
  badgeText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: Layout.fontWeight.bold,
    color: "#1C1C1E",
  },
  upgradeButton: {
    paddingVertical: Layout.spacing.xs + 2,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  upgradeButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.bold,
    color: "#1C1C1E",
  },
  versionText: {
    fontSize: Layout.fontSize.xs,
    textAlign: "center",
    marginTop: Layout.spacing.xl,
  },
});

