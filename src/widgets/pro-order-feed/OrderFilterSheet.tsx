import { StyleSheet, View } from "react-native";
import { ORDER_PRICES, ORDER_SORTS, ORDER_WHENS, countStages, TABS, type OrderSort, type ProOrder } from "@/entities/pro-order";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { cap } from "@/shared/lib/pro/cap";
import { brand, useColors } from "@/shared/theme";
import { BottomSheet, Button, Chip, Icon, IconButton, PressableScale, Segmented, SheetScroll, Text, type IconName } from "@/shared/ui";
import type { OrderFiltersState } from "./useOrderFilters";

type Props = { m: OrderFiltersState; orders: ProOrder[]; shown: number; visible: boolean; onClose: () => void };
const SORT_ICON: Record<OrderSort, IconName> = { new: "arrow-down", old: "arrow-up", priceDesc: "trending-up", priceAsc: "trending-down" };

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={s.section}>
      <View style={s.title}><View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={15} tone="accent" /></View><Text variant="body" weight="bold">{title}</Text></View>
      {children}
    </View>
  );
}

// The orders' filters in one sheet, each part a titled block: stage as chips with counts, sort as icon tiles, period and price band as
// segmented controls; a pinned "reset" + "show N" bar.
export function OrderFilterSheet({ m, orders, shown, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const counts = countStages(orders);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("pof.filters")} snaps={[0.86, 0.94]}>
      <View style={s.flex}>
        <SheetScroll contentContainerStyle={s.body}>
          <Section icon="layers" title={t("pof.stage")}>
            <View style={s.chips}>
              {TABS.map((k) => <Chip key={k} label={`${t(`sl9.tab.${k}`)} · ${counts[k]}`} active={m.f.stage === k} onPress={() => m.set({ stage: k })} />)}
            </View>
          </Section>
          <Section icon="repeat" title={t("pof.sortBy")}>
            <View style={s.tiles}>
              {ORDER_SORTS.map((k) => {
                const on = m.f.sort === k;
                return (
                  <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); m.set({ sort: k }); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { backgroundColor: on ? brand.b600 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
                    <Icon name={SORT_ICON[k]} size={17} color={on ? "#FFFFFF" : c.accent} />
                    <Text variant="small" weight="bold" numberOfLines={2} style={[s.flex, { color: on ? "#FFFFFF" : c.ink }]}>{t(`pof.sort${cap(k)}`)}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </Section>
          <Section icon="calendar" title={t("pof.period")}>
            <Segmented options={ORDER_WHENS.map((k) => ({ value: k, label: t(`pof.period${cap(k)}`) }))} value={m.f.when} onChange={(v) => m.set({ when: v })} />
          </Section>
          <Section icon="credit-card" title={t("pof.price")}>
            <Segmented options={ORDER_PRICES.map((k) => ({ value: k, label: t(`pof.price${cap(k)}`) }))} value={m.f.price} onChange={(v) => m.set({ price: v })} />
          </Section>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("pwc.filter.reset")} onPress={m.reset} />
          <Button title={t("pof.show", { n: shown })} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingTop: 24, gap: 22 },
  section: { gap: 12 },
  title: { flexDirection: "row", alignItems: "center", gap: 10 },
  ico: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48.5%", flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
