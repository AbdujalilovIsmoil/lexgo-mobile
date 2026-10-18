import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useComplaintLabels } from "@/entities/rating";
import type { useComplaintFilters } from "@/features/rating";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ComplaintFilterSheet } from "./ComplaintFilterSheet";

type F = ReturnType<typeof useComplaintFilters>;

// Search and one filter button (type + status live in a sheet); what is applied shows underneath as removable chips.
// Shown only when it can narrow the list (as on the web).
export function ComplaintFilters({ f }: { f: F }) {
  const { t } = useT();
  const L = useComplaintLabels();
  const [open, setOpen] = useState(false);
  if (!f.showBar) return null;
  const sheet = f.bothKinds || f.stages.length > 1;
  const on = f.kind !== "all" || !!f.stage;
  return (
    <View style={s.wrap}>
      <View style={s.search}>
        <View style={s.flex}>{f.searchable ? <SearchBox value={f.q} onChangeText={(v) => f.setQ(v.slice(0, 120))} placeholder={t("pwc.filter.searchPh")} /> : null}</View>
        {sheet ? <IconButton icon="sliders" label={t("dm11.filters")} badge={on} onPress={() => setOpen(true)} /> : null}
      </View>
      {on ? (
        <View style={s.chips}>
          {f.kind !== "all" ? <Chip label={t(`pwc.filter.${f.kind}`)} active icon="x" onPress={() => f.setKind("all")} /> : null}
          {f.stage ? <Chip label={L.stage(f.stage)} active icon="x" onPress={() => f.setStage("")} /> : null}
        </View>
      ) : null}
      <ComplaintFilterSheet f={f} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 10 },
  search: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 },
});
