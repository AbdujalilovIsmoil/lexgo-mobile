import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PERIODS, matchPeriod, periodRange, promoPeriod, rangeError, spanDays, type Placement } from "@/entities/promotion";
import { BottomSheet, Button, DatePickerField, PressableScale, SheetScroll, Text, type IconName } from "@/shared/ui";
import { fmtDate } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { FilterTile } from "./FilterTile";

export type Filters = { type: Placement | ""; from: string; to: string };
export const NO_FILTERS: Filters = { type: "", from: "", to: "" };
const TYPES: [Placement | "", string, IconName][] = [["", "filterAll", "layers"], ["banner", "placementBanner", "image"], ["profile_boost", "placementProfile", "user-check"], ["service_boost", "placementService", "briefcase"]];

type Props = { visible: boolean; value: Filters; onChange: (f: Filters) => void; onApply: () => void; onReset: () => void; onClose: () => void; since?: string };

// Analytics filter as a sheet of tiles: a quick period (all · 7 · 14 · 30 · 90 days · custom) that fills the dates, the promotion
// type as a 2x2 grid, a live «selected» line, and a sticky «Qo'llash» / «Tozalash» footer. Start not after end, at most 90 days.
export function FilterSheet({ visible, value, onChange, onApply, onReset, onClose, since }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  const [custom, setCustom] = useState(false);
  const today = todayKey();
  const open = !value.from && !value.to;
  const preset = matchPeriod(value.from, value.to, today);
  const promo = since ? promoPeriod(since, today) : null;
  const onPromo = !!promo && value.from === promo.from && value.to === promo.to;
  const mode = onPromo && !custom ? "promo" : custom || (!open && preset === null) ? "custom" : open ? "all" : preset;
  const bad = rangeError(value.from, value.to);
  const err = bad ? t(bad === "order" ? "promoSeller.filterOrder" : "promoSeller.filterLong") : undefined;
  const day = (k: string) => fmtDate(`${k}T12:00:00`, locale);
  const line = open ? t("promoSeller.ck.rangeAll")
    : value.from && value.to ? t("promoSeller.ck.rangeLine", { from: day(value.from), to: day(value.to), d: spanDays(value.from, value.to) })
    : value.from ? t("promoSeller.ck.rangeOpenFrom", { from: day(value.from) }) : t("promoSeller.ck.rangeOpenTo", { to: day(value.to) });
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("promoSeller.ck.filterBtn")} snaps={[0.78, 0.92]}>
      <SheetScroll>
        <View style={s.group} accessibilityRole="radiogroup" accessibilityLabel={t("promoSeller.ck.periodTitle")}>
          <Text variant="small" weight="semibold">{t("promoSeller.ck.periodTitle")}</Text>
          <View style={s.grid}>
            {promo ? <FilterTile full icon="zap" label={t("promoSeller.ck.periodPromo")} on={mode === "promo"} onPress={() => { setCustom(false); onChange({ ...value, ...promo }); }} /> : null}
            <FilterTile label={t("promoSeller.ck.periodAll")} on={mode === "all"} onPress={() => { setCustom(false); onChange({ ...value, from: "", to: "" }); }} />
            {PERIODS.map((d) => <FilterTile key={d} label={t("promoSeller.ck.days", { d })} on={mode === d} onPress={() => { setCustom(false); onChange({ ...value, ...periodRange(d, today) }); }} />)}
            <FilterTile label={t("promoSeller.ck.periodCustom")} icon="calendar" on={mode === "custom"} onPress={() => setCustom(true)} />
          </View>
          {mode === "custom" ? (
            <View style={s.dates}>
              <View style={s.fill}><DatePickerField label={t("promoSeller.filterFrom")} value={value.from} onChange={(from) => onChange({ ...value, from })} clearable error={err} /></View>
              <Text variant="body" tone="gray2" accessibilityElementsHidden>→</Text>
              <View style={s.fill}><DatePickerField label={t("promoSeller.filterTo")} value={value.to} onChange={(to) => onChange({ ...value, to })} min={value.from || undefined} clearable /></View>
            </View>
          ) : null}
        </View>
        <View style={s.group} accessibilityRole="radiogroup" accessibilityLabel={t("promoSeller.filterPlacement")}>
          <Text variant="small" weight="semibold">{t("promoSeller.filterPlacement")}</Text>
          <View style={s.grid}>
            {TYPES.map(([p, key, icon]) => <FilterTile key={key} wide icon={icon} label={t(`promoSeller.${key}`)} on={value.type === p} onPress={() => onChange({ ...value, type: p })} />)}
          </View>
        </View>
      </SheetScroll>
      <View style={[s.foot, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
        <Text variant="small" tone={bad ? "err" : "gray"} accessibilityLiveRegion="polite">{bad ? err : line}</Text>
        <View style={s.actions}>
          <PressableScale onPress={onReset} accessibilityRole="button" style={s.reset}><Text variant="body" weight="bold" tone="accent">{t("promoSeller.ck.filterReset")}</Text></PressableScale>
          <Button title={t("promoSeller.ck.filterApply")} disabled={!!bad} onPress={onApply} style={s.fill} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  group: { gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dates: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  fill: { flex: 1 },
  foot: { paddingHorizontal: 18, paddingTop: 10, gap: 8, borderTopWidth: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  reset: { minHeight: 44, minWidth: 88, alignItems: "center", justifyContent: "center" },
});
