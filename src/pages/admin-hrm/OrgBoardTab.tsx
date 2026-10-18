import { useMemo, useState } from "react";
import { View } from "react-native";
import { useBoard, useLocalPaged, type OrgNode } from "@/entities/admin-hrm";
import { OrgHero, OrgNodeRow, defaultOpen, searchRows, treeRows } from "@/widgets/admin-hrm";
import { PagedList, SearchBox } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// The org board as an indented tree (expand / collapse) or, while searching, a flat list of matches.
export function OrgBoardTab({ onUnit }: { onUnit: (n: OrgNode) => void }) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState<Set<string> | null>(null);
  const query = useBoard();
  const nodes = useMemo(() => query.data?.nodes ?? [], [query.data]);
  const open = custom ?? defaultOpen(nodes);
  const needle = useDebounced(q.trim());
  const rows = useMemo(() => (needle ? searchRows(nodes, needle) : treeRows(nodes, open)), [nodes, needle, open]);
  const { items, query: paged } = useLocalPaged(query, rows, 200);
  const toggle = (id: string) => { const next = new Set(open); if (!next.delete(id)) next.add(id); setCustom(next); };
  return (
    <PagedList
      data={items} query={paged} keyExtractor={(r) => r.node.id} empty={{ icon: "layers", title: t("admHrmB.emptyUnits") }} off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }}
      renderItem={(r, i) => <OrgNodeRow index={i} row={r} onToggle={() => toggle(r.node.id)} onPress={() => onUnit(r.node)} />}
      header={<View style={{ gap: 10, marginBottom: 10 }}><OrgHero /><View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("admHrmB.searchBoard")} /></View></View>}
    />
  );
}
