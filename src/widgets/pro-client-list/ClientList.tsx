import { useMemo, useState } from "react";
import { View } from "react-native";
import { ClientRow, useClients, type ProClient } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { useLocalPaged } from "@/shared/lib/pro/useLocalPaged";
import { useDebounced } from "@/shared/lib/useDebounced";
import { TabList } from "@/shared/ui/pro/TabList";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { ClientsHero } from "./ClientsHero";

type Props = { onOpen: (c: ProClient) => void; onAdd: () => void; onCheck: () => void; bottomPad: number };
type Scope = "all" | "active" | "manual" | "conflict";
const IN: Record<Scope, (c: ProClient) => boolean> = { all: () => true, active: (c) => c.activeCaseIds.length > 0, manual: (c) => !c.ordersCount, conflict: (c) => c.hasConflict };

// The client base: a hero with the numbers and the two actions, search, filter chips with live counts (all · with active cases ·
// added manually · conflicts), then one card per client, newest activity first.
export function ClientList({ onOpen, onAdd, onCheck, bottomPad }: Props) {
  const { t } = useT();
  const query = useClients();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const needle = useDebounced(q, 250).trim().toLowerCase();
  const all = useMemo(() => query.data ?? [], [query.data]);
  const searched = useMemo(() => all.filter((c) => !needle || `${c.name} ${c.phone}`.toLowerCase().includes(needle)), [all, needle]);
  const rows = useMemo(() => [...searched.filter(IN[scope])].sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt) || a.name.localeCompare(b.name)), [searched, scope]);
  const { shown, query: paged } = useLocalPaged(rows, query, `${needle}|${scope}`);
  const count = (s: Scope) => searched.filter(IN[s]).length;
  return (
    <TabList
      bottomPad={bottomPad}
      data={shown}
      query={paged}
      keyExtractor={(c) => c.id}
      renderItem={(c, i) => <ClientRow client={c} index={i} onPress={() => onOpen(c)} />}
      header={
        <View style={{ paddingBottom: 12 }}>
          <ClientsHero total={all.length} active={all.filter(IN.active).length} conflicts={all.filter(IN.conflict).length} onAdd={onAdd} onCheck={onCheck} />
          <View style={{ gap: 10, marginHorizontal: -16 }}>
            <SearchBox value={q} onChangeText={setQ} placeholder={t("aw3.search")} />
            <ChipBar value={scope} onChange={setScope} options={(["all", "active", "manual", "conflict"] as const).filter((s) => s === "all" || s === scope || count(s) > 0).map((s) => ({ value: s, label: t(`cln.${s}`), count: count(s) }))} />
          </View>
        </View>
      }
      empty={{ icon: "users", title: all.length ? t("aw3.empty") : t("cln.empty"), text: t("aw3.emptyText") }}
      skeletonHeight={128}
    />
  );
}
