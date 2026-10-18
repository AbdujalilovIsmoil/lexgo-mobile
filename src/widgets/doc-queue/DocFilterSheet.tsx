import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, Icon, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { FLOWS } from "@/entities/doc-queue";
import type { DocFilter } from "./useDocFilter";

type Props = { visible: boolean; onClose: () => void; f: DocFilter; total: number; flows: Record<string, number> };
const FLOW_ICON: Record<string, IconName> = { all: "grid", template_lawyer_assisted: "layers", custom_from_scratch: "edit-3", review_existing_document: "search" };

// A selectable tile (single choice): icon, label and an optional count; the chosen one takes the brand tint.
function Tile({ icon, label, count, on, onPress }: { icon: IconName; label: string; count?: number; on: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <PressableScale haptic={false} onPress={() => { selectHaptic(); onPress(); }} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={count === undefined ? label : `${label}, ${count}`} style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface, borderColor: on ? c.accent : c.line }]}>
      <View style={[s.icon, { backgroundColor: on ? c.accent : c.surface2 }]}><Icon name={icon} size={17} color={on ? "#FFFFFF" : c.accent} /></View>
      <Text variant="small" weight={on ? "bold" : "semibold"} numberOfLines={2} style={s.flex}>{label}</Text>
      {count !== undefined ? <Text variant="caption" tone="gray">{count}</Text> : null}
    </PressableScale>
  );
}

// Filters of the request list: work type as a 2-column grid of icon tiles (with counts), sort as two radio tiles, and a
// sticky footer with «Tozalash» + «Ko'rsatish · N» (the number follows every choice).
export function DocFilterSheet({ visible, onClose, f, total, flows }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const active = f.flow !== "all" || !f.newest;
  const clear = () => { f.setFlow("all"); f.setNewest(true); };
  return (
    <BottomSheet visible={visible} onClose={onClose} snaps={[0.68, 0.86]}>
      <View style={s.fill}>
        <View style={s.head}>
          <Text variant="h4" style={s.flex}>{t("proDocSheet.filterTitle")}</Text>
          {active ? (
            <PressableScale onPress={clear} accessibilityRole="button" accessibilityLabel={t("proDocSheet.clearAll")} hitSlop={8} style={s.link}>
              <Text variant="small" weight="bold" tone="accent">{t("proDocSheet.clearAll")}</Text>
            </PressableScale>
          ) : null}
        </View>
        <SheetScroll contentContainerStyle={s.body}>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("proDocSheet.fWorkTitle")}</Text>
            <View style={s.grid}>
              {["all", ...FLOWS].map((v) => <Tile key={v} icon={FLOW_ICON[v]} label={t(`ad1.flow.${v}`)} count={flows[v] ?? 0} on={f.flow === v} onPress={() => f.setFlow(v)} />)}
            </View>
          </View>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("proDocSheet.sortTitle")}</Text>
            <View style={s.grid}>
              <Tile icon="arrow-down" label={t("proDocSheet.newestShort")} on={f.newest} onPress={() => f.setNewest(true)} />
              <Tile icon="arrow-up" label={t("proDocSheet.oldestShort")} on={!f.newest} onPress={() => f.setNewest(false)} />
            </View>
          </View>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 12 }]}>
          <Button title={t("proDocSheet.reset")} variant="ghost" disabled={!active} onPress={clear} style={s.ghost} />
          <Button title={t("proDocSheet.show", { n: total })} variant="gradient" full onPress={onClose} style={s.main} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingTop: 6 },
  link: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  body: { gap: 22 },
  group: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64, padding: 10, borderRadius: radius.r, borderWidth: 1.5 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12, paddingHorizontal: 18, borderTopWidth: 1 },
  ghost: { minHeight: 48 },
  main: { flex: 1, minHeight: 48 },
  flex: { flex: 1 },
});
