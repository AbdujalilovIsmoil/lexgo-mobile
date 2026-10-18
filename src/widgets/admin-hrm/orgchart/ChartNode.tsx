import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { unitTypeLabel, type OrgNode } from "@/entities/admin-hrm";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { NODE_H, NODE_W, type Placed } from "./chartTypes";

const TINT = ["#6366F1", "#3B82F6", "#06B6D4", "#22C55E"];

// One unit box of the chart: name, type, head, people / position counters and the first names of its people.
export const ChartNode = memo(function ChartNode({ item, onSelect }: { item: Placed; onSelect: (n: OrgNode) => void }) {
  const { t } = useT();
  const c = useColors();
  const n = item.node;
  const tint = TINT[Math.min(n.level, 3)];
  const names = item.people.slice(0, 2).join(", ");
  const more = item.people.length - 2;
  return (
    <PressableScale onPress={() => onSelect(n)} scale={0.97} style={[s.box, { left: item.x, top: item.y, backgroundColor: c.surface, borderColor: tint }]}>
      <View style={s.head}>
        <View style={[s.icon, { backgroundColor: `${tint}22` }]}><Icon name="layers" size={14} color={tint} /></View>
        <Text variant="small" weight="bold" numberOfLines={2} style={s.title}>{n.label}</Text>
      </View>
      <Text variant="caption" tone="gray" numberOfLines={1}>{[n.unitType ? unitTypeLabel(t, n.unitType) : "", n.head].filter(Boolean).join(" · ") || n.sub}</Text>
      <Text variant="caption" tone="gray2" numberOfLines={1}>{names ? `${names}${more > 0 ? ` +${more}` : ""}` : t("ag8.org.noPeople")}</Text>
      <Text variant="caption" weight="bold" style={{ color: tint }} numberOfLines={1}>{t("admHrmB.counts", { p: n.people, q: n.positions })}</Text>
    </PressableScale>
  );
});

const s = StyleSheet.create({
  box: { position: "absolute", width: NODE_W, height: NODE_H, borderWidth: 1.5, borderRadius: radius.r, paddingHorizontal: 10, paddingVertical: 7, gap: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 7 },
  icon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
});
