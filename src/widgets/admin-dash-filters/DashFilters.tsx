import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDemoStore } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { Chip, IconButton, Text } from "@/shared/ui";
import { DateRangeBar } from "@/shared/ui/admin";
import { DashFilterSheet } from "./DashFilterSheet";
import { RegionButton } from "./RegionButton";
import type { DashFilterState } from "./useDashFilter";

// The one filter header of the dashboards: period chips (+ custom dates), region and the demo switch.
// `sheet`: one filter button instead of the period chips and the region field; region and period live in a bottom sheet and what
// is applied shows as chips that can be removed one by one.
export function DashFilters({ f, showDemo = true, sheet }: { f: DashFilterState; showDemo?: boolean; sheet?: boolean }) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const forced = useDemoStore((s) => s.forced);
  const setForced = useDemoStore((s) => s.setForced);
  const filtered = !!(f.filter.region || f.filter.from || f.filter.to);
  if (sheet) {
    const day = (k: string) => fmtDate(`${k}T12:00:00`, locale);
    const preset = f.bar.preset;
    const period = preset === "all" ? "" : preset === "custom" ? [f.bar.from && day(f.bar.from), f.bar.to && day(f.bar.to)].filter(Boolean).join(" – ") || t("adm.custom") : t(`adm.${preset}`);
    return (
      <View style={s.col}>
        <View style={s.row}>
          <View style={s.chips}>
            {f.region ? <Chip label={t(`admDash.region.${f.region}`)} active icon="x" onPress={() => f.setRegion("")} /> : null}
            {period ? <Chip label={period} active icon="x" onPress={() => f.bar.setPreset("all")} /> : null}
            {showDemo ? <Chip icon="zap" label={t("admDash.filter.demo")} active={forced} onPress={() => setForced(!forced)} /> : null}
          </View>
          <IconButton icon="sliders" label={t("dm11.filters")} badge={filtered} onPress={() => setOpen(true)} />
        </View>
        {filtered ? <Text variant="caption" tone="gray2" style={s.note}>{t("admDash.filter.regionNote")}</Text> : null}
        <DashFilterSheet f={f} visible={open} onClose={() => setOpen(false)} />
      </View>
    );
  }
  return (
    <View style={s.col}>
      <DateRangeBar bar={f.bar} withAll />
      <View style={s.row}>
        <RegionButton value={f.region} onChange={f.setRegion} />
        {showDemo ? <Chip icon="zap" label={t("admDash.filter.demo")} active={forced} onPress={() => setForced(!forced)} /> : null}
      </View>
      {filtered ? <Text variant="caption" tone="gray2" style={s.note}>{t("admDash.filter.regionNote")}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16 },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  note: { paddingHorizontal: 16 },
});
