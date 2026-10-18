import { StyleSheet, View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { FactRows, type Fact } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";

// Last look before sending on the client's behalf: the facts, a warning and the error of the last try.
export function ConfirmBody({ rows, note, error }: { rows: Fact[]; note: string; error: string }) {
  const c = useColors();
  return (
    <View style={s.gap}>
      <FactRows rows={rows} />
      <View style={[s.note, { backgroundColor: c.warnBg }]}>
        <Icon name="alert-triangle" size={18} color={c.warn} />
        <Text variant="small" style={s.fill}>{note}</Text>
      </View>
      {error ? <Text variant="small" tone="err">{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  gap: { gap: 12 },
  fill: { flex: 1 },
  note: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 14 },
});
