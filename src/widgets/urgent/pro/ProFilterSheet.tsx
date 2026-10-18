import { StyleSheet, View } from "react-native";
import { PRO_PERIODS, PRO_SORTS, PRO_STATUSES, statusCounts, useUrgentLabels, type ProSort, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import { useInsets } from "@/shared/lib/insets";
import { cap } from "@/shared/lib/pro/cap";
import { brand, useColors } from "@/shared/theme";
import { BottomSheet, Button, Chip, Icon, IconButton, PressableScale, Segmented, SheetScroll, Text, type IconName } from "@/shared/ui";
import type { ProFiltersState } from "./useProFilters";

type Props = { m: ProFiltersState; rows: UrgentRequest[]; shown: number; visible: boolean; onClose: () => void };
const SORT_ICON: Record<ProSort, IconName> = { attention: "alert-circle", waiting: "clock", new: "arrow-down", old: "arrow-up" };

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={s.section}>
      <View style={s.title}><View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={15} tone="accent" /></View><Text variant="body" weight="bold">{title}</Text></View>
      {children}
    </View>
  );
}

// Every sort and filter of the list in one sheet: sort as icon tiles, status as chips with live counts, period as a segmented control;
// a pinned bar with a reset icon button and "Ko'rsatish · N".
export function ProFilterSheet({ m, rows, shown, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const label = useUrgentLabels();
  const counts = statusCounts(rows, m.f);
  const statuses = PRO_STATUSES.filter((x) => counts[x]);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ugx.filters")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <SheetScroll contentContainerStyle={s.body}>
          <Section icon="repeat" title={t("ugx.sortBy")}>
            <View style={s.tiles}>
              {PRO_SORTS.map((k) => {
                const on = m.f.sort === k;
                return (
                  <PressableScale key={k} haptic={false} onPress={() => { selectHaptic(); m.set({ sort: k }); }} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.tile, { backgroundColor: on ? brand.b600 : c.surface2, borderColor: on ? brand.b600 : c.line }]}>
                    <Icon name={SORT_ICON[k]} size={17} color={on ? "#FFFFFF" : c.accent} />
                    <Text variant="small" weight="bold" numberOfLines={2} style={[s.flex, { color: on ? "#FFFFFF" : c.ink }]}>{t(`ugx.sort${cap(k)}`)}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </Section>
          <Section icon="flag" title={t("ugx.status")}>
            <View style={s.chips}>
              <Chip label={`${t("ugx.statusAll")} · ${counts[""]}`} active={!m.f.status} onPress={() => m.set({ status: "" })} />
              {statuses.map((x) => <Chip key={x} label={`${label.status(x)} · ${counts[x]}`} active={m.f.status === x} onPress={() => m.set({ status: m.f.status === x ? "" : x })} />)}
            </View>
          </Section>
          <Section icon="calendar" title={t("ugx.period")}>
            <Segmented options={PRO_PERIODS.map((k) => ({ value: k, label: t(`ugx.period${cap(k)}`) }))} value={m.f.period} onChange={(v) => m.set({ period: v })} />
          </Section>
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("ugx.reset")} onPress={m.reset} />
          <Button title={t("ugx.show", { n: shown })} variant="gradient" full style={s.flex} onPress={onClose} />
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
