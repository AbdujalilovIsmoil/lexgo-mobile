import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, PressableScale } from "@/shared/ui";
import { gradient, shadows } from "@/shared/theme";

// Round "+" in the thumb's reach (bottom right): opens the new-meeting sheet.
export function CreateFab({ label, bottom, onPress }: { label: string; bottom: number; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[s.fab, { bottom }]}>
      <LinearGradient colors={[...gradient.primary]} locations={[...gradient.primaryStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fill}>
        <Icon name="plus" size={26} color="#FFFFFF" />
      </LinearGradient>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  fab: { position: "absolute", right: 16, width: 58, height: 58, borderRadius: 29, ...shadows.blue },
  fill: { flex: 1, borderRadius: 29, alignItems: "center", justifyContent: "center" },
});
