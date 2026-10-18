import { StyleSheet, View } from "react-native";
import { categoryIcon } from "@/entities/service";
import { BottomSheet, Button, Icon, IconButton, PressableScale, SheetScroll, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { FilterGroups } from "./FilterGroups";
import type { Hub } from "./useServicesHub";

// Every way to narrow and order the services in one sheet: the directions as icon cards with live counts, then document kind,
// executor, price band and sort, and a pinned bar with "reset" and "show N".
export function ServicesFilterSheet({ hub, visible, onClose }: { hub: Hub; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const total = Object.values(hub.counts.cat).reduce((a, b) => a + b, 0);
  const cards = [{ id: "", name: t("svh.all"), icon: "layers" as const, n: total }, ...hub.cats.filter((x) => (hub.counts.cat[x.id] ?? 0) > 0 || hub.f.cat === x.id).map((x) => ({ id: x.id, name: x.name, icon: categoryIcon(x), n: hub.counts.cat[x.id] ?? 0 }))];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.82, 0.95]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("svh.direction")}</Text>
            <View style={s.grid}>
              {cards.map((k) => {
                const on = hub.f.cat === k.id;
                return (
                  <PressableScale key={k.id || "all"} haptic={false} onPress={() => { selectHaptic(); hub.set({ cat: k.id }); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.card, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}>
                    <View style={[s.tile, { backgroundColor: on ? c.accent : c.surface }]}><Icon name={k.icon} size={18} color={on ? "#FFFFFF" : c.accent} /></View>
                    <View style={s.flex}><Text variant="small" weight="bold" numberOfLines={2}>{k.name}</Text><Text variant="caption" tone="gray">{k.n}</Text></View>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          <FilterGroups hub={hub} />
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("svh.reset")} onPress={hub.reset} />
          <Button title={`${t("dm11.fShow")} · ${hub.rows.length}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 10, marginBottom: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { flexBasis: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64, padding: 10, borderRadius: radius.r, borderWidth: 1.5 },
  tile: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
