import { StyleSheet, View } from "react-native";
import { SORTS, WHENS, regionsOf, type Budget, type Job, type Sort } from "@/entities/market-feed";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { cap } from "@/shared/lib/pro/cap";
import { selectHaptic } from "@/shared/lib/haptics";
import { brand, useColors } from "@/shared/theme";
import { BottomSheet, Button, Chip, Icon, IconButton, PressableScale, Segmented, SheetScroll, Text, type IconName } from "@/shared/ui";
import type { MarketFilters } from "./useMarketFilters";

type Props = { m: MarketFilters; jobs: Job[]; shown: number; visible: boolean; onClose: () => void };
const SORT_ICON: Record<Sort, IconName> = { new: "arrow-down", old: "arrow-up", budgetDesc: "trending-up", budgetAsc: "trending-down", deadline: "clock" };
const BUDGET: { v: Budget; key: string }[] = [{ v: "any", key: "bAny" }, { v: "low", key: "bLow" }, { v: "mid", key: "bMid" }, { v: "high", key: "bHigh" }];

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={s.section}>
      <View style={s.title}><View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={15} tone="accent" /></View><Text variant="body" weight="bold">{title}</Text></View>
      {children}
    </View>
  );
}

// The feed's filters in one sheet, each part a titled block: sort as tiles with an icon (the chosen one is filled), region as chips with
// counts, budget and arrival window as segmented controls; a pinned "reset" + "show N" bar.
export function MarketFilterSheet({ m, jobs, shown, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const regions = regionsOf(jobs);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("mkt.filters")} snaps={[regions.length ? 0.86 : 0.7, 0.94]}>
      <View style={s.flex}>
        <SheetScroll contentContainerStyle={s.body}>
          <Section icon="repeat" title={t("mkt.sortBy")}>
            <View style={s.tiles}>
              {SORTS.map((k, i) => {
                const on = m.f.sort === k;
                const wide = i === SORTS.length - 1 && SORTS.length % 2 === 1;
                return (
                  <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); m.set({ sort: k }); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, wide && s.wide, { backgroundColor: on ? brand.b600 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
                    <Icon name={SORT_ICON[k]} size={17} color={on ? "#FFFFFF" : c.accent} />
                    <Text variant="small" weight="bold" numberOfLines={2} style={[s.flex, { color: on ? "#FFFFFF" : c.ink }]}>{t(`mkt.sort${cap(k)}`)}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </Section>
          {regions.length ? (
            <Section icon="map-pin" title={t("mkt.region")}>
              <View style={s.chips}>
                <Chip label={t("mkt.allRegions")} active={!m.f.region} onPress={() => m.set({ region: "" })} />
                {regions.map((r) => <Chip key={r.name} label={`${r.name} · ${r.count}`} active={m.f.region === r.name} onPress={() => m.set({ region: m.f.region === r.name ? "" : r.name })} />)}
              </View>
            </Section>
          ) : null}
          <Section icon="credit-card" title={t("mkt.budget")}>
            <Segmented options={BUDGET.map((b) => ({ value: b.v, label: t(`mkt.${b.key}`) }))} value={m.f.budget} onChange={(v) => m.set({ budget: v })} />
          </Section>
          <Section icon="calendar" title={t("mkt.when")}>
            <Segmented options={WHENS.map((k) => ({ value: k, label: t(`mkt.when${cap(k)}`) }))} value={m.f.when} onChange={(v) => m.set({ when: v })} />
          </Section>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("pwc.filter.reset")} onPress={m.reset} />
          <Button title={t("mkt.show", { n: shown })} variant="gradient" full style={s.flex} onPress={onClose} />
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
  wide: { width: "100%" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
