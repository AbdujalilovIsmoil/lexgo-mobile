import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CASE_STATUSES, CaseRow, isClosedCase, useCases, type ProCase } from "@/entities/pro-cases";
import { useClients } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { useLocalPaged } from "@/shared/lib/pro/useLocalPaged";
import { useDebounced } from "@/shared/lib/useDebounced";
import { PagedList, SearchBox } from "@/shared/ui/admin";
import { IconButton, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { CasesFilterSheet } from "./CasesFilterSheet";

type Filter = "all" | "open" | (typeof CASE_STATUSES)[number];
// The quick chips over the list (Adliya): all, in progress, waiting (new), closed; the rest of the statuses stay in the filter sheet.
const CHIPS: Filter[] = ["all", "open", "new", "completed"];

// The professional's cases (Adliya): the status chips, the search with the filter sheet, then one white card per case.
export function CaseList({ onOpen }: { onOpen: (c: ProCase) => void }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const query = useCases();
  const clients = useClients().data;
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState(false);
  const needle = useDebounced(q, 250).trim().toLowerCase();
  const names = useMemo(() => new Map((clients ?? []).map((c) => [c.id, c.name])), [clients]);
  const all = useMemo(() => query.data ?? [], [query.data]);
  const match = (c: ProCase, f: Filter) => (f === "all" ? true : f === "open" ? !isClosedCase(c.status) : c.status === f);
  const rows = useMemo(() => all.filter((c) => match(c, filter) && (!needle || `${names.get(c.clientUserId) ?? ""} ${c.title} ${c.number} ${c.nextAction}`.toLowerCase().includes(needle))), [all, filter, needle, names]);
  const { shown, query: paged } = useLocalPaged(rows, query, `${filter}|${needle}`);
  const filters: Filter[] = ["open", "all", ...CASE_STATUSES];
  const options = filters.map((f) => ({ value: f, count: all.filter((c) => match(c, f)).length }));
  const label = (f: Filter) => (f === "open" ? t("aw4.open") : f === "all" ? t("aw4.all") : tOr(t, `aw11.caseStatus.${f}`, f));
  return (
    <>
    <PagedList
      data={shown}
      query={paged}
      keyExtractor={(c) => c.id}
      renderItem={(c, i) => <CaseRow item={c} index={i} client={names.get(c.clientUserId)} onPress={() => onOpen(c)} />}
      header={
        <View style={{ gap: 12, paddingBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ marginHorizontal: -16 }}>
            {CHIPS.map((f) => {
              const on = filter === f;
              return (
                <PressableScale key={f} onPress={() => setFilter(f)} scale={0.96} accessibilityRole="button" accessibilityState={{ selected: on }} style={[st.chip, on ? { backgroundColor: c.accentStrong, borderColor: c.accentStrong } : { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E2E8F1" }]}>
                  <Text variant="small" weight="bold" style={{ color: on ? "#FFFFFF" : c.ink, fontSize: 14.5 }}>{label(f)}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
          <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: -16, paddingRight: 16 }}><View style={{ flex: 1 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("aw4.search")} /></View><IconButton icon="sliders" label={t("dm11.filters")} badge={!CHIPS.includes(filter)} onPress={() => setSheet(true)} /></View>
        </View>
      }
      empty={{ icon: "briefcase", title: all.length ? t("aw4.emptyFilter") : t("aw4.empty"), text: all.length ? undefined : t("aw4.emptyText") }}
      skeletonHeight={150}
    />
    <CasesFilterSheet visible={sheet} onClose={() => setSheet(false)} value={filter} onChange={(v) => setFilter(v as Filter)} options={options} total={rows.length} />
    </>
  );
}

const st = StyleSheet.create({ chip: { minHeight: 40, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1.5, alignItems: "center", justifyContent: "center" } });
