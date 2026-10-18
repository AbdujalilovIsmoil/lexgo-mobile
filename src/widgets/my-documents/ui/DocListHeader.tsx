import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { DocMode } from "@/entities/my-document";
import { filterChips } from "@/features/my-documents";
import { DocFilterSheet } from "./DocFilterSheet";
import { DocScope, type StatKey } from "./DocScope";

type Props = {
  counts: Record<string, number>;
  statusCounts: Record<string, number>;
  total: number;
  loading: boolean;
  group: StatKey;
  mode: "" | DocMode;
  q: string;
  status: string;
  seen: string[];
  onStatus: (s: string) => void;
  onGroup: (g: StatKey) => void;
  onMode: (m: "" | DocMode) => void;
  onQuery: (q: string) => void;
};

// Top of the list: the archive split (pills with counts), a search over every document and a filter button — mode and
// exact status live in a sheet, and what is applied from it shows underneath as chips that can be removed one by one.
export function DocListHeader({ counts, statusCounts, total, loading, group, mode, q, status, seen, onGroup, onMode, onQuery, onStatus }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const modes: { value: "" | DocMode; label: string }[] = [
    { value: "", label: t("dm1.mode.all") },
    { value: "manual", label: t("dm1.mode.manual") },
    { value: "ai", label: t("dm1.mode.ai") },
    { value: "lawyer", label: t("dm1.mode.lawyer") },
  ];
  const word = (v: string) => (t(`dm2.status.${v.toLowerCase()}`) === `dm2.status.${v.toLowerCase()}` ? v : t(`dm2.status.${v.toLowerCase()}`));
  const states = [{ value: "", label: t("dm11.allStatuses") }, ...seen.map((v) => ({ value: v, label: word(v) }))];
  const chips = filterChips({ mode, status }, { mode: (m) => t(`docSheet.modeShort.${m}`), status: word });
  return (
    <View style={s.col}>
      <DocScope counts={counts} value={group} onChange={onGroup} loading={loading} />
      <View style={s.search}>
        <View style={s.flex}><SearchBox value={q} onChangeText={onQuery} placeholder={t("dm1.searchPh")} /></View>
        <IconButton icon="sliders" label={t("docSheet.filter")} badge={!!mode || !!status} onPress={() => setOpen(true)} />
      </View>
      {chips.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {chips.map((c) => <Chip key={c.key} label={c.label} active icon="x" onPress={() => (c.key === "mode" ? onMode("") : onStatus(""))} />)}
        </ScrollView>
      ) : null}
      <DocFilterSheet visible={open} onClose={() => setOpen(false)} mode={mode} status={status} modes={modes} states={states} statusCounts={statusCounts} total={total} onMode={onMode} onStatus={onStatus} onReset={() => { onMode(""); onStatus(""); }} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12, marginHorizontal: -16, paddingBottom: 12 },
  search: { flexDirection: "row", alignItems: "center", paddingRight: 16, gap: 0 },
  flex: { flex: 1 },
  chips: { gap: 8, paddingHorizontal: 16 },
});
