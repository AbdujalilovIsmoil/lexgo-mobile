import { StyleSheet, View } from "react-native";
import { KIND_ICON, KIND_TINT, KINDS, useWorkText } from "@/entities/work";
import type { GroupFilter, KindFilter, WorkFilters } from "@/features/work-filters";
import { BottomSheet, Button, Icon, IconButton, PressableScale, SheetScroll, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; filters: WorkFilters; onChange: (p: Partial<WorkFilters>) => void; kindCounts: Record<string, number>; groupCounts: Record<string, number>; groups: GroupFilter[]; total: number; onReset: () => void };

// Kind and status group in one sheet: the kinds as icon cards with live counts, the groups as a list with a coloured dot
// and a count, and a pinned bar with "reset" and "show N". Counts ignore their own dimension, so nothing promises empty rows.
export function WorksFilterSheet({ visible, onClose, filters, onChange, kindCounts, groupCounts, groups, total, onReset }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const text = useWorkText();
  const dot: Record<string, string> = { queue: c.warn, active: c.accent, review: "#00CFE8", done: c.ok, closed: c.gray2, open: c.accent, all: c.gray };
  const kinds = KINDS.filter((k) => kindCounts[k] > 0 || filters.kind === k);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.82, 0.94]}>
      <View style={s.fill}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("wks.kind")}</Text>
            <View style={s.grid}>
              {([["all", "layers", t("cl1.allKinds"), Object.values(kindCounts).reduce((a, b) => a + b, 0)], ...kinds.map((k) => [k, KIND_ICON[k], text.kind(k), kindCounts[k]])] as [KindFilter, never, string, number][]).map(([k, icon, label, n]) => {
                const on = filters.kind === k;
                const tint = k === "all" ? c.accent : KIND_TINT[k];
                return (
                  <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); onChange({ kind: k }); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.card, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
                    <View style={[s.tile, { backgroundColor: on ? tint : c.surface }]}><Icon name={icon} size={18} color={on ? "#FFFFFF" : tint} /></View>
                    <View style={s.flex}><Text variant="small" weight="bold" numberOfLines={2}>{label}</Text><Text variant="caption" tone="gray">{n}</Text></View>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("wks.status")}</Text>
            <View style={s.list}>
              {groups.map((g) => {
                const on = filters.group === g;
                return (
                  <PressableScale key={g} haptic={false} onPress={() => { selectHaptic(); onChange({ group: g }); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.row, { backgroundColor: on ? c.tint2 : "transparent", borderColor: on ? c.accent : "transparent" }]}>
                    <View style={[s.dot, { backgroundColor: dot[g] ?? c.gray }]} />
                    <Text variant="body" weight={on ? "bold" : "regular"} numberOfLines={1} style={s.flex}>{text.group(g)}</Text>
                    <Text variant="caption" tone="gray">{groupCounts[g] ?? 0}</Text>
                    <View style={[s.radio, { borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>{on ? <Icon name="check" size={13} color="#FFFFFF" /> : null}</View>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("dm1.reset")} onPress={onReset} />
          <Button title={`${t("dm11.fShow")} · ${total}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  group: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64, padding: 10, borderRadius: radius.r, borderWidth: 1.5 },
  tile: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
  flex: { flex: 1 },
});
