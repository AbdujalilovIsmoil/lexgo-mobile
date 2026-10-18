import { useMemo, useState } from "react";
import { View } from "react-native";
import { ACTIVITY_GROUPS, ActivityRow, groupOf, useActivity, useLocalPaged } from "@/entities/security";
import { ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { KindBar, type HistoryKind } from "./KindBar";

// The user's own audit log (the backend sends all of it): group chips + search, shown 20 at a time.
export function ActivityList({ onKind }: { onKind: (k: HistoryKind) => void }) {
  const { t } = useT();
  const q = useActivity();
  const [group, setGroup] = useState("all");
  const [search, setSearch] = useState("");
  const needle = useDebounced(search, 250).trim().toLowerCase();
  const found = useMemo(() => {
    const all = q.data ?? [];
    return needle ? all.filter((a) => `${a.action} ${a.detail} ${a.titleUz} ${a.descriptionUz} ${a.ip}`.toLowerCase().includes(needle)) : all;
  }, [q.data, needle]);
  const counts = useMemo(() => {
    const n: Record<string, number> = {};
    for (const a of found) n[groupOf(a.action)] = (n[groupOf(a.action)] ?? 0) + 1;
    return n;
  }, [found]);
  const rows = useMemo(() => (group === "all" ? found : found.filter((a) => groupOf(a.action) === group)), [found, group]);
  const { items, query, reset } = useLocalPaged(rows, q);
  const options = [{ value: "all", label: t("adm.all"), count: found.length }, ...ACTIVITY_GROUPS.filter((g) => counts[g]).map((g) => ({ value: g, label: t(`admSecC.grp.${g}`), count: counts[g] }))];
  const none = (q.data?.length ?? 0) > 0;
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(a) => a.id}
      renderItem={(a) => <ActivityRow item={a} />}
      empty={{ icon: none ? "search" : "clock", title: t(none ? "admSecC.noMatch" : "admSecC.actEmpty"), text: t(none ? "admSecC.noMatchText" : "admSecC.actEmptyText") }}
      header={
        <View style={{ marginHorizontal: -16, gap: 8, marginBottom: 12 }}>
          <KindBar value="activity" onChange={onKind} />
          <ChipBar options={options} value={group} onChange={(g) => { setGroup(g); reset(); }} />
          <SearchBox value={search} onChangeText={(v) => { setSearch(v); reset(); }} placeholder={t("admSecC.searchPh")} />
        </View>
      }
    />
  );
}
