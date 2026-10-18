import { useMemo, useState } from "react";
import { View } from "react-native";
import { CASE_STATUSES, CaseRow, dueOf, isClosedCase, useCases, type ProCase } from "@/entities/pro-cases";
import { useClients } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { useLocalPaged } from "@/shared/lib/pro/useLocalPaged";
import { useDebounced } from "@/shared/lib/useDebounced";
import { PagedList, SearchBox } from "@/shared/ui/admin";
import { Chip, IconButton } from "@/shared/ui";
import { CasesFilterSheet } from "./CasesFilterSheet";
import { CasesSummary } from "./CasesSummary";

type Filter = "all" | "open" | (typeof CASE_STATUSES)[number];

// Searchable list of the professional's cases with status chips; the client's name is the headline.
export function CaseList({ onOpen }: { onOpen: (c: ProCase) => void }) {
  const { t } = useT();
  const query = useCases();
  const clients = useClients().data;
  const [filter, setFilter] = useState<Filter>("open");
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
      header={<View style={{ gap: 10, paddingBottom: 12 }}><CasesSummary total={all.length} active={all.filter((c) => !isClosedCase(c.status)).length} soon={all.filter((c) => ["overdue", "today", "soon"].includes(dueOf(c.deadlineAt, isClosedCase(c.status)))).length} done={all.filter((c) => isClosedCase(c.status)).length} /><View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: -16, paddingRight: 16 }}><View style={{ flex: 1 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("aw4.search")} /></View><IconButton icon="sliders" label={t("dm11.filters")} badge={filter !== "open"} onPress={() => setSheet(true)} /></View>{filter !== "open" ? <View style={{ flexDirection: "row" }}><Chip label={label(filter)} active icon="x" onPress={() => setFilter("open")} /></View> : null}</View>}
      empty={{ icon: "briefcase", title: all.length ? t("aw4.emptyFilter") : t("aw4.empty"), text: all.length ? undefined : t("aw4.emptyText") }}
      skeletonHeight={150}
    />
    <CasesFilterSheet visible={sheet} onClose={() => setSheet(false)} value={filter} onChange={(v) => setFilter(v as Filter)} options={options} total={rows.length} />
    </>
  );
}