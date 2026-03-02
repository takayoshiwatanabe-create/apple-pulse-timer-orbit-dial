import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { initDatabase } from "@/utils/database";
import { useSettingsStore } from "@/stores/settingsStore";
import { Colors } from "@/constants/Colors";
import { useReviewPrompt } from "@/hooks/useReviewPrompt";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const theme = useSettingsStore((s) => s.theme);
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const systemScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  useReviewPrompt();

  const resolvedScheme =
    theme === "auto" ? (systemScheme ?? "light") : theme;
  const colors = Colors[resolvedScheme];

  useEffect(() => {
    async function prepare() {
      await initDatabase();
      await loadSettings();
      setIsReady(true);
      SplashScreen.hideAsync();
    }
    prepare();
  }, [loadSettings]);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingCompleted && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingCompleted && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isReady, onboardingCompleted, segments, router]);

  if (!isReady) {
    return (
      <View
        style={[styles.loading, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/index" />
      </Stack>
      <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
