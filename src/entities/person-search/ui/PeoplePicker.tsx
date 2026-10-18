import { useMemo, useState, type ReactNode } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { Button, EmptyState, ErrorView, Icon, Input, PressableScale, Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { arrange } from "../lib/arrange";
import { canFinish, doneLabel, isPicked, removeId, toggle } from "../lib/selection";
import { useRecentPeople } from "../model/recentStore";
import { usePeople, type Person } from "../model/usePeople";
import { ChosenRow } from "./ChosenRow";
import { PeopleSkeleton } from "./PeopleSkeleton";
import { PickRow } from "./PickRow";

type Props = {
  me: string;
  enabled?: boolean; // false → no request yet (a hidden page)
  note?: ReactNode;
  onPick?: (p: Person) => void; // single pick: the caller reacts (and closes)
  busyId?: string;
  selected?: Person[]; // multi pick: the chosen people (kept by the caller)
  onChange?: (list: Person[]) => void;
  onDone?: () => void; // multi pick: shows the "Done · n" bar
  min?: number; // "Done" stays off until this many are picked
};

// Telegram-style contact picker body: search on top, the chosen people as avatar chips, the results with round
// checkboxes, and a "Done · n" bar. Lives in a sheet (PeopleSheet) or inside another sheet's page (new meeting).
export function PeoplePicker({ me, enabled = true, note, onPick, busyId, selected = [], onChange, onDone, min = 0 }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [q, setQ] = useState("");
  const query = useDebounced(q, 300);
  const people = usePeople(query, me, enabled);
  const saved = useRecentPeople((s) => s.list);
  const remember = useRecentPeople((s) => s.remember);
  const multi = !!onChange;
  const sections = useMemo(() => arrange(people.data ?? [], multi ? saved : [], query, me), [people.data, multi, saved, query, me]);
  const typing = q.trim() !== query.trim();
  const tap = (p: Person) => (multi ? onChange(toggle(selected, p)) : onPick?.(p));
  const finish = () => { remember(selected); onDone?.(); };
  const loading = people.isLoading || (typing && !sections.length);
  const bad = people.isError && !sections.length;
  return (
    <View style={s.root}>
      <View style={s.search}>
        <Input
          value={q}
          onChangeText={setQ}
          placeholder={t("meetUx.searchPh")}
          left={<Icon name="search" size={18} tone="gray" />}
          right={q ? <PressableScale onPress={() => setQ("")} hitSlop={10} accessibilityLabel={t("meetUx.clear")}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : undefined}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {note}
      {multi ? <ChosenRow list={selected} onRemove={(id) => onChange(removeId(selected, id))} /> : null}
      <SectionList
        sections={loading || bad ? [] : sections}
        keyExtractor={(p) => p.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={s.list}
        contentContainerStyle={[s.content, { paddingBottom: onDone ? 12 : insets.bottom + 16 }]}
        renderSectionHeader={({ section }) => (section.key === "results" ? null : <Text variant="small" tone="gray" weight="semibold" style={[s.head, { backgroundColor: c.surface }]}>{t(`meetUx.${section.key}`)}</Text>)}
        renderItem={({ item }) => <PickRow person={item} picked={isPicked(selected, item.id)} multi={multi} busy={busyId === item.id} onPress={tap} />}
        ListEmptyComponent={
          loading ? <PeopleSkeleton />
            : bad ? <ErrorView compact error={people.error} onRetry={() => void people.refetch()} />
            : <EmptyState compact icon={query.trim().length < 2 && !query.trim() ? "search" : "user-x"} title={t(query.trim() ? "meetUx.none" : "meetUx.typeMore")} text={query.trim() ? t("meetUx.noneText") : undefined} />
        }
      />
      {multi && onDone ? (
        <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }]}>
          <Button title={doneLabel(selected.length, t("meetUx.done"), (n) => t("meetUx.doneN", { n }))} variant="gradient" full disabled={!canFinish(selected.length, min)} onPress={finish} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  search: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 4 },
  list: { flex: 1 },
  content: { paddingTop: 6, flexGrow: 1 },
  head: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 },
  bar: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1 },
});
