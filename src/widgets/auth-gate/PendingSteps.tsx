import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "What happens next" for an account waiting for an admin.
export function PendingSteps() {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      {[1, 2, 3].map((n) => (
        <View key={n} style={[s.row, { backgroundColor: c.surface, borderColor: c.line }]}>
          <View style={[s.badge, { backgroundColor: c.tint2 }]}>
            <Text variant="small" weight="bold" tone="accent">{n}</Text>
          </View>
          <Text variant="small" style={s.text}>{t(`au3.step${n}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.r, borderWidth: 1 },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  text: { flex: 1 },
});
