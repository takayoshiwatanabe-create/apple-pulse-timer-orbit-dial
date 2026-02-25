import { StyleSheet, Text, View } from "react-native";
import { useAppColors } from "@/hooks/useColorScheme";

export default function SettingsScreen() {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
