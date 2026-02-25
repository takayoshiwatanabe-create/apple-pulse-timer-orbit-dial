import { useColorScheme as useRNColorScheme } from "react-native";
import { useSettingsStore } from "@/stores/settingsStore";
import { Colors } from "@/constants/Colors";

export function useAppColors() {
  const systemScheme = useRNColorScheme();
  const theme = useSettingsStore((s) => s.theme);

  const resolvedScheme =
    theme === "auto" ? (systemScheme ?? "light") : theme;

  return Colors[resolvedScheme];
}
