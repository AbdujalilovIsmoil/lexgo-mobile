import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { PayGroup } from "@/entities/payment";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox, type DateRange } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { PaymentFilterSheet } from "./PaymentFilterSheet";

type Props = { group: PayGroup; onGroup: (g: PayGroup) => void; counts: Record<PayGroup, number>; search: string; onSearch: (v: string) => void; bar: DateRange };

// Search and one filter button; status and period live in a sheet, and what is applied shows underneath as chips that can
// be removed one by one (the button carries a dot while any is on).
export function PaymentFilters({ group, onGroup, counts, search, onSearch, bar }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const period = bar.preset !== "all";
  const reset = () => { onGroup("all"); bar.setPreset("all"); };
  return (
    <View style={s.wrap}>
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={search} onChangeText={onSearch} placeholder={t("py1.searchPh")} /></View>
        <IconButton icon="sliders" label={t("dm11.filters")} badge={group !== "all" || period} onPress={() => setOpen(true)} />
      </View>
      {group !== "all" || period ? (
        <View style={s.chips}>
          {group !== "all" ? <Chip label={t(`py1.group.${group}`)} active icon="x" onPress={() => onGroup("all")} /> : null}
          {period ? <Chip label={t(`adm.${bar.preset}`)} active icon="x" onPress={() => bar.setPreset("all")} /> : null}
        </View>
      ) : null}
      <PaymentFilterSheet visible={open} onClose={() => setOpen(false)} group={group} onGroup={onGroup} counts={counts} bar={bar} total={counts[group]} onReset={reset} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 10, marginBottom: 6 },
  search: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
});
