import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useWorkText } from "@/entities/work";
import type { GroupFilter, WorkFilters } from "@/features/work-filters";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { WorksFilterSheet } from "./WorksFilterSheet";

type Props = {
  filters: WorkFilters;
  onChange: (patch: Partial<WorkFilters>) => void;
  kindCounts: Record<string, number>;
  groupCounts: Record<string, number>;
  groups: GroupFilter[];
  total: number;
  onReset: () => void;
};

// Search and one filter button; kind and status group live in a sheet, and what is applied shows underneath as chips that
// can be removed one by one (the button carries a dot while any is on).
export function WorksFilterBar({ filters, onChange, kindCounts, groupCounts, groups, total, onReset }: Props) {
  const { t } = useT();
  const text = useWorkText();
  const [open, setOpen] = useState(false);
  const on = filters.kind !== "all" || filters.group !== "all";
  return (
    <View style={s.wrap}>
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={filters.q} onChangeText={(q) => onChange({ q })} placeholder={t("cl1.search")} /></View>
        <IconButton icon="sliders" label={t("dm11.filters")} badge={on} onPress={() => setOpen(true)} />
      </View>
      {on ? (
        <View style={s.chips}>
          {filters.kind !== "all" ? <Chip label={text.kind(filters.kind)} active icon="x" onPress={() => onChange({ kind: "all" })} /> : null}
          {filters.group !== "all" ? <Chip label={text.group(filters.group)} active icon="x" onPress={() => onChange({ group: "all" })} /> : null}
        </View>
      ) : null}
      <WorksFilterSheet visible={open} onClose={() => setOpen(false)} filters={filters} onChange={onChange} kindCounts={kindCounts} groupCounts={groupCounts} groups={groups} total={total} onReset={onReset} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 10, paddingBottom: 12 },
  search: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
});
