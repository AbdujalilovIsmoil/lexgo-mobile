import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Workload } from "../model/workTypes";

const ITEMS: { key: keyof Workload; icon: IconName; label: string }[] = [
  { key: "orders", icon: "shopping-bag", label: "og2.orders" },
  { key: "cases", icon: "briefcase", label: "og2.cases" },
  { key: "urgent", icon: "zap", label: "og2.urgent" },
];

// Three counters (active orders / cases / urgent requests) of one member.
export function WorkloadChips({ w }: { w: Workload }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.row}>
      {ITEMS.map((it) => (
        <View key={it.key} style={[s.chip, { backgroundColor: c.surface2 }]}>
          <Icon name={it.icon} size={13} tone={w[it.key] > 0 ? "accent" : "gray"} />
          <Text variant="caption" weight="bold">{w[it.key]}</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{t(it.label)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 99, flexShrink: 1 },
});
