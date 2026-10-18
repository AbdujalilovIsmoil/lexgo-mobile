import { StyleSheet, View } from "react-native";
import { Icon, Pill, Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { integrationTone } from "../model/queries";
import type { Integration } from "../model/types";

// One integration: a coloured dot, its name, a lock when only the superadmin manages it, and its status.
export function IntegrationTile({ item, last }: { item: Integration; last?: boolean }) {
  const { t } = useT();
  const c = useColors();
  const tone = integrationTone(item);
  const dot = { ok: c.ok, warn: c.warn, err: c.err, gray: c.gray2 }[tone];
  const known = (k: string, fb: string) => (t(k) !== k ? t(k) : fb);
  return (
    <View style={[s.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
      <View style={[s.dot, { backgroundColor: dot }]} />
      <Text variant="body" weight="semibold" numberOfLines={1} style={s.name}>{known(`admInt.keys.${item.key}`, item.label || humanizeSlug(item.key))}</Text>
      {item.requiresSuperadmin ? <Icon name="lock" size={14} tone="gray" /> : null}
      <Pill small tone={tone} label={known(`admInt.status.${item.status}`, humanizeSlug(item.status || "unknown"))} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1 },
});
