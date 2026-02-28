import { useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useAppColors } from "@/hooks/useColorScheme";
import { useStatsStore } from "@/stores/statsStore";
import { AdBanner } from "@/components/ads/AdBanner";
import { SandGradient } from "@/components/ui/SandGradient";
import { Layout } from "@/constants/Layout";
import { formatMinutes, getWeekStartDate } from "@/utils/formatTime";
import type { DailyStats } from "@/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHART_HEIGHT = 120;

function getFullWeekMinutes(weeklyStats: DailyStats[]): number[] {
  const weekStart = getWeekStartDate();
  const startDate = new Date(weekStart + "T00:00:00");
  const minutesByDay: number[] = new Array<number>(7).fill(0);

  for (const stat of weeklyStats) {
    const statDate = new Date(stat.date + "T00:00:00");
    const dayIndex = Math.round(
      (statDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex >= 0 && dayIndex < 7) {
      minutesByDay[dayIndex] = stat.totalFocusTime;
    }
  }

  return minutesByDay;
}

function getTodayDayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { todayStats, weeklyStats, isLoading, refreshAll } = useStatsStore();

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const weekData = useMemo(
    () => getFullWeekMinutes(weeklyStats),
    [weeklyStats]
  );
  const maxMinutes = useMemo(() => Math.max(...weekData, 1), [weekData]);
  const todayDayIndex = useMemo(() => getTodayDayIndex(), []);

  const todayFocusTime = todayStats?.totalFocusTime ?? 0;
  const todaySessions = todayStats?.sessionsCompleted ?? 0;
  const todayInterruptions = todayStats?.sessionsInterrupted ?? 0;
  const streak = todayStats?.streakDays ?? 0;

  const weeklyTotalMinutes = useMemo(
    () => weeklyStats.reduce((sum, day) => sum + day.totalFocusTime, 0),
    [weeklyStats]
  );
  const weeklySessionCount = useMemo(
    () => weeklyStats.reduce((sum, day) => sum + day.sessionsCompleted, 0),
    [weeklyStats]
  );
  const weeklyAvg = useMemo(() => {
    const daysWithData = weeklyStats.length;
    return daysWithData > 0 ? Math.round(weeklyTotalMinutes / daysWithData) : 0;
  }, [weeklyStats, weeklyTotalMinutes]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Layout.spacing.md,
          paddingBottom: insets.bottom + Layout.spacing.xxl,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshAll}
          tintColor={colors.tint}
        />
      }
      accessibilityRole="summary"
      accessibilityLabel="Statistics dashboard"
    >
      <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>

      {/* Today Summary Cards */}
      <View style={styles.cardRow}>
        <View
          style={[styles.card, { backgroundColor: colors.surface }, Layout.shadow.sm]}
          accessibilityRole="text"
          accessibilityLabel={`Focus time today: ${formatMinutes(todayFocusTime)}`}
        >
          <SandGradient
            sessionType="focus"
            style={styles.cardGradient}
            opacity={0.12}
          />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Focus Time
          </Text>
          <Text style={[styles.cardValue, { color: colors.focusRing }]}>
            {formatMinutes(todayFocusTime)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textTertiary }]}>
            today
          </Text>
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.surface }, Layout.shadow.sm]}
          accessibilityRole="text"
          accessibilityLabel={`Sessions completed today: ${todaySessions}`}
        >
          <SandGradient
            sessionType="break"
            style={styles.cardGradient}
            opacity={0.12}
          />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Sessions
          </Text>
          <Text style={[styles.cardValue, { color: colors.breakRing }]}>
            {todaySessions}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textTertiary }]}>
            completed
          </Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View
          style={[styles.card, { backgroundColor: colors.surface }, Layout.shadow.sm]}
          accessibilityRole="text"
          accessibilityLabel={`Current streak: ${streak} days`}
        >
          <SandGradient
            sessionType="long_break"
            style={styles.cardGradient}
            opacity={0.12}
          />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Streak
          </Text>
          <Text style={[styles.cardValue, { color: colors.longBreakRing }]}>
            {streak}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textTertiary }]}>
            days
          </Text>
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.surface }, Layout.shadow.sm]}
          accessibilityRole="text"
          accessibilityLabel={`Interrupted sessions today: ${todayInterruptions}`}
        >
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            Interrupted
          </Text>
          <Text style={[styles.cardValue, { color: colors.warning }]}>
            {todayInterruptions}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textTertiary }]}>
            today
          </Text>
        </View>
      </View>

      {/* Weekly Bar Chart */}
      <View
        style={[styles.section, { backgroundColor: colors.surface }, Layout.shadow.sm]}
        accessibilityRole="image"
        accessibilityLabel={`Weekly focus chart. Total ${formatMinutes(weeklyTotalMinutes)} this week.`}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          This Week
        </Text>

        <View style={styles.chart}>
          {weekData.map((minutes, index) => {
            const barHeight =
              maxMinutes > 0 ? (minutes / maxMinutes) * CHART_HEIGHT : 0;
            const isToday = index === todayDayIndex;

            return (
              <View key={DAY_LABELS[index]} style={styles.barColumn}>
                <Text
                  style={[styles.barValue, { color: colors.textTertiary }]}
                >
                  {minutes > 0 ? `${minutes}` : ""}
                </Text>
                <View
                  style={[
                    styles.barTrack,
                    { backgroundColor: colors.separator },
                  ]}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, minutes > 0 ? 4 : 0),
                        backgroundColor: isToday
                          ? colors.focusRing
                          : colors.tint,
                        opacity: isToday ? 1 : 0.5,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    { color: isToday ? colors.text : colors.textTertiary },
                    isToday && { fontWeight: Layout.fontWeight.semibold },
                  ]}
                >
                  {DAY_LABELS[index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Weekly Summary */}
      <View
        style={[styles.section, { backgroundColor: colors.surface }, Layout.shadow.sm]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Weekly Summary
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Focus
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatMinutes(weeklyTotalMinutes)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.separator }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Sessions
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {weeklySessionCount}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.separator }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Daily Average
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatMinutes(weeklyAvg)}
          </Text>
        </View>
      </View>

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
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    marginBottom: Layout.spacing.lg,
  },
  cardRow: {
    flexDirection: "row",
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    overflow: "hidden",
    alignItems: "center",
  },
  cardGradient: {
    borderRadius: Layout.borderRadius.lg,
  },
  cardLabel: {
    fontSize: Layout.fontSize.xs,
    fontWeight: Layout.fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Layout.spacing.xs,
  },
  cardValue: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.bold,
  },
  cardSub: {
    fontSize: Layout.fontSize.xs,
    marginTop: 2,
  },
  section: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    marginBottom: Layout.spacing.md,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: CHART_HEIGHT + 40,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: Layout.spacing.xs,
  },
  barValue: {
    fontSize: 10,
    height: 14,
  },
  barTrack: {
    width: 24,
    height: CHART_HEIGHT,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: Layout.borderRadius.sm,
  },
  barLabel: {
    fontSize: Layout.fontSize.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Layout.spacing.sm,
  },
  summaryLabel: {
    fontSize: Layout.fontSize.sm,
  },
  summaryValue: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.semibold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
