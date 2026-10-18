import { useMemo, useState } from "react";
import { View } from "react-native";
import { STAGES, TaskRow, isDone, sortTasks, stageOf, useTaskStatus, useTasks, type ProTask } from "@/entities/pro-tasks";
import { useT } from "@/shared/i18n";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useLocalPaged } from "@/shared/lib/pro/useLocalPaged";
import { ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";

type Filter = "open" | "all" | (typeof STAGES)[number];

// Filterable task list: open / all / one stage, search, tick to complete, tap to edit.
export function TaskList({ onOpen }: { onOpen: (t: ProTask) => void }) {
  const { t } = useT();
  const query = useTasks();
  const move = useTaskStatus();
  const [filter, setFilter] = useState<Filter>("open");
  const [q, setQ] = useState("");
  const needle = useDebounced(q, 250).trim().toLowerCase();
  const all = useMemo(() => query.data ?? [], [query.data]);
  const rows = useMemo(() => {
    const list = all.filter((x) => (filter === "all" ? true : filter === "open" ? !isDone(x) : stageOf(x.status) === filter));
    return sortTasks(needle ? list.filter((x) => `${x.title} ${x.description} ${x.caseTitle}`.toLowerCase().includes(needle)) : list);
  }, [all, filter, needle]);
  const { shown, query: paged } = useLocalPaged(rows, query, `${filter}|${needle}`);
  const count = (f: Filter) => all.filter((x) => (f === "all" ? true : f === "open" ? !isDone(x) : stageOf(x.status) === f)).length;
  const options = (["open", "all", ...STAGES] as Filter[]).map((f) => ({ value: f, label: t(`aw7.stage.${f}`), count: count(f) }));
  return (
    <PagedList
      data={shown}
      query={paged}
      keyExtractor={(x) => x.id}
      renderItem={(x) => <TaskRow task={x} onPress={() => onOpen(x)} onToggle={() => move.mutate({ id: x.id, status: isDone(x) ? "todo" : "done" })} />}
      header={
        <View style={{ gap: 10, paddingBottom: 12 }}>
          <SearchBox value={q} onChangeText={setQ} placeholder={t("aw7.search")} />
          <ChipBar options={options} value={filter} onChange={setFilter} />
        </View>
      }
      empty={{ icon: "check-square", title: all.length ? t("aw7.emptyFilter") : t("aw7.empty"), text: all.length ? undefined : t("aw7.emptyText") }}
      skeletonHeight={78}
    />
  );
}
