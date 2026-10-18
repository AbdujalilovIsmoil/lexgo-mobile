import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import type { Lawyer } from "@/entities/lawyer";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Key/value rows with hairlines; rows without a value are skipped.
export function InfoTab({ lawyer: l }: { lawyer: Lawyer }) {
  const c = useColors();
  const { t } = useT();
  const rows = [
    [t("lawyers.detail.education"), l.education],
    [t("lawyers.detail.license"), l.licenseNumber],
    [t("lawyers.detail.organization"), l.barAssociation || l.organizationName],
    [t("flt.region"), [l.region, l.district].filter(Boolean).join(", ")],
  ].filter((r) => r[1]) as [string, string][];
  return (
    <View style={[s.box, { borderColor: c.line }]}>
      {rows.map(([k, v], i) => (
        <View key={k} style={[s.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
          <Text variant="caption" tone="gray" style={s.k}>{k}</Text>
          <Text variant="small" weight="semibold" style={s.v}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", gap: 10, padding: 13 },
  k: { width: 96 },
  v: { flex: 1 },
});
