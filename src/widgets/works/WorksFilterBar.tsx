import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { KINDS, useWorkText } from "@/entities/work";
import type { GroupFilter, KindFilter, WorkFilters } from "@/features/work-filters";
import { Icon, PressableScale, Text, singleLineText } from "@/shared/ui";
import { useColors } from "@/shared/theme";
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
  docsLink?: boolean;
};

// The search with the filter button (the status group lives in its sheet; the button carries the count of what is on), the kinds as
// chips with their counts (only kinds that have works), the status group when one is on as a removable chip, and the archive link.
export function WorksFilterBar({ filters, onChange, kindCounts, groupCounts, groups, total, onReset, docsLink }: Props) {
  const { t } = useT();
  const c = useColors();
  const text = useWorkText();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const on = (filters.kind !== "all" ? 1 : 0) + (filters.group !== "all" ? 1 : 0);
  const kinds = KINDS.filter((k) => (kindCounts[k] ?? 0) > 0 || filters.kind === k);
  const chip = (k: KindFilter, label: string, n?: number) => {
    const sel = filters.kind === k;
    return (
      <PressableScale key={k} onPress={() => onChange({ kind: sel && k !== "all" ? "all" : k })} scale={0.96} accessibilityRole="button" accessibilityState={{ selected: sel }}
        style={[s.chip, sel ? { backgroundColor: c.ink, borderColor: c.ink } : { backgroundColor: c.surface, borderColor: c.line }]}>
        <Text variant="small" weight="semibold" style={{ color: sel ? c.surface : c.ink }}>{label}</Text>
        {n ? <Text variant="caption" weight="bold" style={{ color: sel ? c.surface : c.gray }}>{n}</Text> : null}
      </PressableScale>
    );
  };
  return (
    <View style={s.wrap}>
      <View style={s.searchRow}>
        <View style={[s.field, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name="search" size={19} tone="gray" />
          <TextInput value={filters.q} onChangeText={(q) => onChange({ q })} placeholder={t("cl1.search")} placeholderTextColor={c.gray2} returnKeyType="search" accessibilityLabel={t("cl1.search")} style={[s.input, { color: c.ink }, singleLineText]} />
          {filters.q ? <PressableScale onPress={() => onChange({ q: "" })} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("dcat.clearSearch")}><Icon name="x" size={17} tone="gray" /></PressableScale> : null}
        </View>
        <PressableScale onPress={() => setOpen(true)} scale={0.95} accessibilityRole="button" accessibilityLabel={t("dm11.filters")} style={[s.btn, { backgroundColor: c.surface, borderColor: on ? c.accent : c.line }]}>
          <Icon name="sliders" size={20} color={on ? c.accent : c.ink} />
          {on ? <View style={[s.dot, { backgroundColor: c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.dotTx}>{on}</Text></View> : null}
        </PressableScale>
      </View>
      {kinds.length > 1 || filters.kind !== "all" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.chips}>
          {chip("all", t("cl1.list.allKinds"))}
          {kinds.map((k) => chip(k, text.kind(k), kindCounts[k]))}
        </ScrollView>
      ) : null}
      {filters.group !== "all" ? (
        <View style={s.pad}>
          <PressableScale onPress={() => onChange({ group: "all" })} accessibilityRole="button" style={[s.groupChip, { backgroundColor: c.tint2 }]}>
            <Text variant="small" weight="semibold" tone="accent">{filters.group === "queue" ? t("cl1.list.waiting") : text.group(filters.group)}</Text>
            <Icon name="x" size={14} tone="accent" />
          </PressableScale>
        </View>
      ) : null}
      {docsLink ? (
        <PressableScale onPress={() => router.push("/documents" as never)} accessibilityRole="button" style={[s.docs, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name="file-text" size={17} color={c.accent} />
          <Text variant="small" weight="semibold" style={s.flex}>{t("cl1.list.docs")}</Text>
          <Icon name="chevron-right" size={17} tone="gray" />
        </PressableScale>
      ) : null}
      <WorksFilterSheet visible={open} onClose={() => setOpen(false)} filters={filters} onChange={onChange} kindCounts={kindCounts} groupCounts={groupCounts} groups={groups} total={total} onReset={onReset} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: -16, gap: 12, paddingBottom: 14 },
  pad: { paddingHorizontal: 16, flexDirection: "row" },
  flex: { flex: 1 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minHeight: 54, borderRadius: 18, borderWidth: 1, paddingLeft: 16, paddingRight: 12 },
  input: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 12 },
  btn: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  dotTx: { fontSize: 10, lineHeight: 12 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
  groupChip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  docs: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, paddingHorizontal: 14, minHeight: 48, borderRadius: 16, borderWidth: 1 },
});
