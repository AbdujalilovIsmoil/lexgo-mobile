import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Chip, Icon, PressableScale, Text, singleLineText } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { RA_OPENER, RA_PICK, RA_VIEW, raFail, raOk, useRaControl } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";
import type { DocMode } from "@/entities/my-document";
import { filterChips } from "@/features/my-documents";
import { DocFilterSheet } from "./DocFilterSheet";
import { DocScope, type StatKey } from "./DocScope";

type Props = {
  counts: Record<string, number>;
  modeCounts: Record<string, number>;
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

// Top of the list (the look of "Mening ishlarim"): the three counters, a search over every document with the filter button (exact status
// lives in its sheet; the button counts what is on), the modes as chips with their counts, and what the sheet applied as removable chips.
export function DocListHeader({ counts, modeCounts, statusCounts, total, loading, group, mode, q, status, seen, onGroup, onMode, onQuery, onStatus }: Props) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const modes: { value: "" | DocMode; label: string }[] = [
    { value: "", label: t("dm1.mode.all") },
    { value: "manual", label: t("dm1.mode.manual") },
    { value: "ai", label: t("dm1.mode.ai") },
    { value: "lawyer", label: t("dm1.mode.lawyer") },
  ];
  const word = (v: string) => (t(`dm2.status.${v.toLowerCase()}`) === `dm2.status.${v.toLowerCase()}` ? v : t(`dm2.status.${v.toLowerCase()}`));
  const states = [{ value: "", label: t("dm11.allStatuses") }, ...seen.map((v) => ({ value: v, label: word(v) }))];
  const chips = filterChips({ mode: "", status }, { mode: (m) => t(`docSheet.modeShort.${m}`), status: word }); // the mode has its own chip row
  const on = status ? 1 : 0;
  // Remote assistance: the mode switch, the search and the filter sheet are on the operator's map (`my_documents.*`).
  const modeRa = useRaControl({
    id: "my_documents.mode",
    label: t("ra.el.docMode"),
    actions: RA_PICK,
    state: mode ? "selected" : "unselected",
    select: (v) => {
      const m = modes.find((x) => x.value === v.trim());
      if (!m) return raFail("option_not_found");
      onMode(m.value);
      return raOk();
    },
  });
  const searchRa = useRaControl({
    id: "my_documents.search",
    label: t("ra.el.docQuery"),
    actions: [...RA_VIEW, "form.set_value"],
    state: q.trim() ? "filled" : "empty",
    setValue: (v) => {
      onQuery(v.slice(0, 200));
      return raOk();
    },
  });
  const filtersRa = useRaControl({
    id: "my_documents.filters",
    label: t("ra.el.docFilters"),
    actions: RA_OPENER,
    state: open ? "selected" : "ready",
    open: () => {
      setOpen(true);
      return raOk();
    },
  });
  return (
    <View style={s.col}>
      <DocScope counts={counts} value={group} onChange={onGroup} loading={loading} />
      <View style={s.search}>
        <View {...searchRa} style={[s.field, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name="search" size={19} tone="gray" />
          <TextInput value={q} onChangeText={onQuery} placeholder={t("dm1.searchPh")} placeholderTextColor={c.gray2} returnKeyType="search" accessibilityLabel={t("dm1.searchPh")} style={[s.input, { color: c.ink }, singleLineText]} />
          {q ? <PressableScale onPress={() => onQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")}><Icon name="x" size={17} tone="gray" /></PressableScale> : null}
        </View>
        <View {...filtersRa}>
          <PressableScale onPress={() => setOpen(true)} scale={0.95} accessibilityRole="button" accessibilityLabel={t("docSheet.filter")} style={[s.btn, { backgroundColor: c.surface, borderColor: on ? c.accent : c.line }]}>
            <Icon name="sliders" size={20} color={on ? c.accent : c.ink} />
            {on ? <View style={[s.dot, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.dotTx}>{on}</Text></View> : null}
          </PressableScale>
        </View>
      </View>
      <View {...modeRa}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.chips}>
          {modes.map((m) => {
            const sel = mode === m.value;
            const n = loading ? 0 : modeCounts[m.value || "all"] ?? 0;
            return (
              <PressableScale key={m.value || "all"} onPress={() => onMode(sel && m.value ? "" : m.value)} scale={0.96} accessibilityRole="button" accessibilityState={{ selected: sel }}
                style={[s.chip, sel ? { backgroundColor: c.ink, borderColor: c.ink } : { backgroundColor: c.surface, borderColor: c.line }]}>
                <Text variant="small" weight="semibold" style={{ color: sel ? c.bg : c.ink }}>{m.label}</Text>
                {n ? <Text variant="caption" weight="bold" style={{ color: sel ? c.bg : c.gray }}>{n}</Text> : null}
              </PressableScale>
            );
          })}
        </ScrollView>
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
  search: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 54, borderRadius: 18, borderWidth: 1, paddingLeft: 16, paddingRight: 12 },
  input: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 12 },
  btn: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  dotTx: { fontSize: 10, lineHeight: 12 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
});
