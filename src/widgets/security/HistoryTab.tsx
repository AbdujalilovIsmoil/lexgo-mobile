import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { JOURNAL_PAGE, EMPTY_FILTER, filterJournal, groupByDay, hasAnyFilter, pageWindow, removeChip, useJournal, type FilterChip, type JournalEntry, type JournalFilter } from "@/entities/security";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { Button, EmptyState, ErrorView, Text } from "@/shared/ui";
import { JournalControls } from "./JournalControls";
import { JournalEntrySheet } from "./JournalEntrySheet";
import { JournalFilterSheet } from "./JournalFilterSheet";
import { JournalRow } from "./JournalRow";
import { JournalSkeleton } from "./JournalSkeleton";
import { dayLabel } from "./journalText";

type Item = { type: "day"; id: string; label: string } | { type: "row"; id: string; entry: JournalEntry; last: boolean };

// "Journal" tab: the audit log and security events as a day-grouped timeline, 10 at a time. Category and period
// filters live in a bottom sheet; the selected ones show as removable chips.
export function HistoryTab() {
  const { t, locale } = useT();
  const insets = useInsets();
  const j = useJournal();
  const [kinds, setKinds] = useState<JournalFilter["kinds"]>([]);
  const [period, setPeriod] = useState<JournalFilter["period"]>("all");
  const [search, setSearch] = useState("");
  const q = useDebounced(search, 250);
  const [shown, setShown] = useState(JOURNAL_PAGE);
  const [sheet, setSheet] = useState<"filter" | "entry" | null>(null);
  const [opens, setOpens] = useState(0);
  const [picked, setPicked] = useState<JournalEntry | null>(null);

  const filter = useMemo<JournalFilter>(() => ({ kinds, period, q }), [kinds, period, q]);
  const rows = useMemo(() => filterJournal(j.all, filter), [j.all, filter]);
  const win = pageWindow(rows.length, shown);
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const g of groupByDay(rows.slice(0, win.count))) {
      out.push({ type: "day", id: `d:${g.id}`, label: dayLabel(g.day, t, locale) });
      g.entries.forEach((entry, i) => out.push({ type: "row", id: entry.id, entry, last: i === g.entries.length - 1 }));
    }
    return out;
  }, [rows, win.count, t, locale]);

  const apply = (f: JournalFilter) => { setKinds(f.kinds); setPeriod(f.period); setShown(JOURNAL_PAGE); };
  const clearAll = () => { apply(EMPTY_FILTER); setSearch(""); };
  const filtered = hasAnyFilter(filter);
  const hasData = j.all.length > 0;

  const body = j.isLoading ? <JournalSkeleton /> : j.isError ? <ErrorView error={j.error} onRetry={() => void j.refetch()} />
    : !hasData ? <EmptyState icon="clock" title={t("secUx.emptyTitle")} text={t("secUx.emptyText")} />
    : <EmptyState icon="search" title={t("secUx.noMatchTitle")} text={t("secUx.noMatchText")} actionLabel={filtered ? t("secUx.clearFilters") : undefined} onAction={clearAll} />;

  return (
    <>
      <FlatList
        data={j.isLoading || j.isError ? [] : items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => item.type === "day"
          ? <Text variant="small" weight="bold" tone="gray" accessibilityRole="header" style={{ paddingTop: 16, paddingBottom: 10 }}>{item.label}</Text>
          : <JournalRow entry={item.entry} last={item.last} onPress={() => { setPicked(item.entry); setSheet("entry"); }} />}
        ListHeaderComponent={hasData || filtered ? (
          <JournalControls
            filter={filter}
            search={search}
            total={rows.length}
            onSearch={(v) => { setSearch(v); setShown(JOURNAL_PAGE); }}
            onOpenFilter={() => { setOpens((n) => n + 1); setSheet("filter"); }}
            onRemove={(c: FilterChip) => apply(removeChip(filter, c))}
          />
        ) : null}
        ListEmptyComponent={body}
        ListFooterComponent={win.hasMore ? (
          <View style={{ alignItems: "center", gap: 8, paddingTop: 8 }}>
            <Button title={t("secUx.more", { n: win.next })} variant="soft" onPress={() => setShown((n) => n + JOURNAL_PAGE)} />
            <Text variant="caption" tone="gray">{t("secUx.counter", { shown: win.count, total: rows.length })}</Text>
          </View>
        ) : null}
        refreshing={j.isRefetching}
        onRefresh={() => void j.refetch()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <JournalFilterSheet key={opens} visible={sheet === "filter"} onClose={() => setSheet(null)} all={j.all} filter={filter} onApply={apply} />
      <JournalEntrySheet entry={picked} visible={sheet === "entry"} onClose={() => setSheet(null)} />
    </>
  );
}
