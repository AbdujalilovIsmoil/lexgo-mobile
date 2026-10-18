import { StyleSheet, View } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { IncludeList } from "@/entities/package";
import { Card, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The package as it was when bought (a snapshot: later Studio edits never change a paid order).
export function PackageCard({ order: o }: { order: MarketOrder }) {
  const { t } = useT();
  const p = o.pack;
  if (!p) return null;
  return (
    <Card style={s.card}>
      <View style={s.head}><Icon name="package" size={18} tone="accent" /><Text variant="body" weight="bold" style={s.flex}>{p.title}</Text></View>
      {p.code ? <Text variant="caption" tone="gray">{p.code}</Text> : null}
      {p.customItems.map((c) => (
        <View key={c.title} style={s.item}>
          <Text variant="small" weight="semibold">{c.title}{c.required ? " *" : ""}</Text>
          {c.description ? <Text variant="caption" tone="gray">{c.description}</Text> : null}
        </View>
      ))}
      {p.included.length || p.excluded.length ? <IncludeList included={p.included} excluded={p.excluded} /> : null}
      <Text variant="caption" tone="gray2">{t("ntd.od.snapshot")}</Text>
    </Card>
  );
}

const s = StyleSheet.create({ card: { gap: 8, padding: 14 }, head: { flexDirection: "row", alignItems: "center", gap: 8 }, flex: { flex: 1 }, item: { gap: 1 } });
