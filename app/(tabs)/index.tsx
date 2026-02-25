import { StyleSheet, Text, View } from "react-native";
import { useAppColors } from "@/hooks/useColorScheme";

export default function HomeScreen() {
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Apple Pulse Timer
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Orbit Dial
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
  },
});
