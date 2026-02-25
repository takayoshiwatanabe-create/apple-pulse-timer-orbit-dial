import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useColorScheme } from "react-native";
import { initDatabase } from "@/utils/database";
import { useSettingsStore } from "@/stores/settingsStore";
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const theme = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();

  const resolvedScheme =
    theme === "auto" ? (systemScheme ?? "light") : theme;
  const colors = Colors[resolvedScheme];

  useEffect(() => {
    async function prepare() {
      await initDatabase();
      await loadSettings();
      setIsReady(true);
    }
    prepare();
  }, [loadSettings]);

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
