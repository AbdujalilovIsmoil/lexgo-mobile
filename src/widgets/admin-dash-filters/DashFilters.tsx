import { StyleSheet, View } from "react-native";
import { useDemoStore } from "@/entities/admin-dash";
import { useT } from "@/shared/i18n";
import { Chip, Text } from "@/shared/ui";
import { DateRangeBar } from "@/shared/ui/admin";
import { RegionButton } from "./RegionButton";
import type { DashFilterState } from "./useDashFilter";

// The one filter header of the dashboards: period chips (+ custom dates), region and the demo switch.
export function DashFilters({ f, showDemo = true }: { f: DashFilterState; showDemo?: boolean }) {
  const { t } = useT();
  const forced = useDemoStore((s) => s.forced);
  const setForced = useDemoStore((s) => s.setForced);
  const filtered = !!(f.filter.region || f.filter.from || f.filter.to);
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
  note: { paddingHorizontal: 16 },
});
