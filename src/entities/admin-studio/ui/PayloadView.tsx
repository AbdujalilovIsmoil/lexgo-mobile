import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";

const MAX = 8;
const scalar = (v: unknown): string => (v == null || v === "" ? "—" : typeof v === "boolean" ? (v ? "✓" : "—") : String(v));

// Read-only view of any payload: keys as small labels, nested objects indented, lists capped at 8.
export function PayloadView({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const { t } = useT();
  const c = useColors();
  if (Array.isArray(value)) {
    if (!value.length) return <Text variant="caption" tone="gray2">{t("admStudioB.noItems")}</Text>;
    return (
      <View style={s.col}>
        {value.slice(0, MAX).map((x, i) => (
          <View key={i} style={s.item}>
            <Text variant="small" tone="gray">•</Text>
            <View style={s.fill}><PayloadView value={x} depth={depth + 1} /></View>
          </View>
        ))}
        {value.length > MAX ? <Text variant="caption" tone="gray2">{t("admStudioB.moreItems", { n: value.length - MAX })}</Text> : null}
      </View>
    );
  }
  if (value && typeof value === "object") {
    const rows = Object.entries(value).filter(([, v]) => v !== undefined && v !== null);
    if (!rows.length) return <Text variant="caption" tone="gray2">{t("admStudioB.noData")}</Text>;
    return (
      <View style={[s.col, depth > 0 && { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: c.line }]}>
        {rows.map(([k, v]) => (
          <View key={k} style={{ gap: 2 }}>
            <Text variant="caption" tone="gray">{humanizeSlug(k)}</Text>
            <PayloadView value={v} depth={depth + 1} />
          </View>
        ))}
      </View>
    );
  }
  return <Text variant="small" selectable>{scalar(value)}</Text>;
}

const s = StyleSheet.create({ col: { gap: 8 }, item: { flexDirection: "row", gap: 6 }, fill: { flex: 1 } });
