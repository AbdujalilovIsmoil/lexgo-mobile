import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, IconButton } from "@/shared/ui";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { DOC_TABS, filterChips, type DocTab } from "@/entities/doc-queue";
import { DocFilterSheet } from "./DocFilterSheet";
import { SummaryStrip } from "./SummaryStrip";
import type { DocFilter } from "./useDocFilter";

type Props = { tab: DocTab; onTab: (t: DocTab) => void; counts: Record<string, number>; f: DocFilter; total: number; flows: Record<string, number> };

// Top of the list: three summary tiles, status tabs with counts, a search with one Filtr button
// (work type + sort live in its sheet) and what is applied from it as removable chips.
export function DocListHead({ tab, onTab, counts, f, total, flows }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const tabs = DOC_TABS.map((v) => ({ value: v, label: t(`ad1.tab.${v}`), count: counts[v] }));
  const chips = filterChips(f, { flow: (v) => t(`ad1.flow.${v}`), oldest: t("proDocSheet.oldest") });
  return (
    <View style={s.col}>
      <SummaryStrip counts={counts} tab={tab} onTab={onTab} />
      <ChipBar options={tabs} value={tab} onChange={onTab} />
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={f.q} onChangeText={f.setQ} placeholder={t("ad1.search")} /></View>
        <IconButton icon="sliders" label={t("proDocSheet.filter")} badge={chips.length > 0} onPress={() => setOpen(true)} />
      </View>
      {chips.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {chips.map((c) => <Chip key={c.key} label={c.label} active icon="x" onPress={() => (c.key === "flow" ? f.setFlow("all") : f.setNewest(true))} />)}
        </ScrollView>
      ) : null}
      <DocFilterSheet visible={open} onClose={() => setOpen(false)} f={f} total={total} flows={flows} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12, marginHorizontal: -16, paddingBottom: 12 },
  search: { flexDirection: "row", alignItems: "center", paddingRight: 16 },
  flex: { flex: 1 },
  pad: { paddingHorizontal: 16 },
  chips: { gap: 8, paddingHorizontal: 16 },
});
