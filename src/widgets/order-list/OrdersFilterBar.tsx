import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { OrdersFilterSheet } from "./OrdersFilterSheet";
import type { useMyOrders } from "./useMyOrders";

// Search and one filter button; status and sort live in a sheet, and what is applied shows underneath as removable chips
// (the button carries a dot while any is on).
export function OrdersFilterBar({ m }: { m: ReturnType<typeof useMyOrders> }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const on = m.stage !== "all" || m.sort !== "new";
  return (
    <View style={s.wrap}>
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={m.q} onChangeText={m.setQ} placeholder={t("mk4.searchPh")} /></View>
        <IconButton icon="sliders" label={t("dm11.filters")} badge={on} onPress={() => setOpen(true)} />
      </View>
      {on ? (
        <View style={s.chips}>
          {m.stage !== "all" ? <Chip label={t(`mk4.tabs.${m.stage}`)} active icon="x" onPress={() => m.setStage("all")} /> : null}
          {m.sort !== "new" ? <Chip label={t(`ods.${m.sort}`)} active icon="x" onPress={() => m.setSort("new")} /> : null}
        </View>
      ) : null}
      <OrdersFilterSheet visible={open} onClose={() => setOpen(false)} m={m} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 10, marginBottom: 12 },
  search: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
});
