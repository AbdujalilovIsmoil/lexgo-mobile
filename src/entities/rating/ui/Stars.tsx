import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "@/shared/ui";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

export const STAR_GOLD = "#F5B301";

// Read-only row of five stars.
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={s.row} accessibilityRole="image" accessibilityLabel={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => <Ionicons key={n} name={n <= value ? "star" : "star-outline"} size={size} color={STAR_GOLD} />)}
    </View>
  );
}

// The 1–5 star picker of the rating form.
export function StarInput({ value, onChange, disabled }: { value: number; onChange: (n: number) => void; disabled?: boolean }) {
  const { t } = useT();
  return (
    <View style={[s.row, s.input]} accessibilityRole="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <PressableScale key={n} haptic={false} disabled={disabled} hitSlop={6} accessibilityRole="radio" accessibilityState={{ selected: value === n }} accessibilityLabel={t("a11y.stars", { n })} onPress={() => { selectHaptic(); onChange(n); }}>
          <Ionicons name={n <= value ? "star" : "star-outline"} size={42} color={STAR_GOLD} />
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", gap: 3 }, input: { gap: 8, justifyContent: "center" } });
