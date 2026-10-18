import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { CATEGORIES, ReglamentRow, useGates, useRegLabels, useReglaments, type Reglament } from "@/entities/admin-aireg";
import { PagedList } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { MissingState } from "./MissingState";
import { ReglamentDetailSheet } from "./ReglamentDetailSheet";
import { RegFilters } from "./RegFilters";

type Props = { canEdit: boolean; editBusy: string; onEdit: (r: Reglament) => void };

// The reglaments: status tiles, search, collapsed category filter, ticket rows and a detail sheet with the versions.
export function ReglamentsTab({ canEdit, editBusy, onEdit }: Props) {
  const { t } = useT();
  const l = useRegLabels();
  const q = useReglaments();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [st, setSt] = useState("");
  const [open, setOpen] = useState<Reglament | null>(null);
  const words = useDebounced(search, 250);
  const items = useMemo(() => (q.data?.kind === "ok" ? q.data.data : []), [q.data]);
  const shown = useMemo(() => {
    const terms = words.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((r) => (!cat || r.category === cat) && (!st || r.status === st) && terms.every((w) => [r.title, r.category, l.cat(r.category), r.version, r.fileName, r.content].join(" ").toLowerCase().includes(w)));
  }, [items, words, cat, st, l]);
  if (q.data?.kind === "missing") return <MissingState busy={q.isRefetching} onRecheck={() => { useGates.getState().clear(); void q.refetch(); }} />;
  const present = [...new Set([...CATEGORIES.filter((c) => items.some((r) => r.category === c)), ...items.map((r) => r.category).filter(Boolean)])];
  return (
    <>
      <PagedList
        data={shown} query={q} keyExtractor={(r) => r.id || r.title} skeletonHeight={104}
        renderItem={(r, i) => <Animated.View entering={i < 8 ? FadeInUp.delay(i * 30).duration(200) : undefined}><ReglamentRow item={r} onPress={() => setOpen(r)} onEdit={canEdit ? () => onEdit(r) : undefined} busy={editBusy === r.id} /></Animated.View>}
        empty={{ icon: "file-text", title: items.length ? t("admAiReg.noResults") : t("admAiReg.empty"), text: items.length ? t("admAiReg.noResultsText") : t("admAiReg.emptyText") }}
        header={items.length ? <View style={{ marginHorizontal: -16 }}><RegFilters items={items} present={present} search={search} onSearch={setSearch} cat={cat} onCat={setCat} st={st} onSt={setSt} /></View> : null}
      />
      <ReglamentDetailSheet item={open} canEdit={canEdit} onEdit={(r) => { setOpen(null); setTimeout(() => onEdit(r), 340); }} onClose={() => setOpen(null)} />
    </>
  );
}
