import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { GapRow, isOpenGap, useGaps, useGates, type Gap, type GapFilter } from "@/entities/admin-aireg";
import { PagedList, SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { MissingState } from "./MissingState";
import { RegHero } from "./RegHero";

// Questions the AI could not answer (most asked first); open or all, searchable. "Add" writes the answer into a reglament.
export function GapsTab({ added, canAdd, onAdd }: { added: string[]; canAdd: boolean; onAdd: (g: Gap) => void }) {
  const { t } = useT();
  const [filter, setFilter] = useState<GapFilter>("open");
  const [search, setSearch] = useState("");
  const q = useGaps(filter);
  const words = useDebounced(search, 250);
  const all = useMemo(() => (q.data?.kind === "ok" ? q.data.data : []), [q.data]);
  const items = useMemo(() => {
    const terms = words.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((g) => terms.every((w) => [g.question, g.userName, g.userPhone, g.sessionId, g.reason, ...g.missing].join(" ").toLowerCase().includes(w))).sort((a, b) => b.count - a.count || Date.parse(b.lastAskedAt || "0") - Date.parse(a.lastAskedAt || "0"));
  }, [all, words]);
  if (q.data?.kind === "missing") return <MissingState busy={q.isRefetching} onRecheck={() => { useGates.getState().clear(); void q.refetch(); }} />;
  return (
    <PagedList
      data={items} query={q} keyExtractor={(g) => g.key} skeletonHeight={120}
      renderItem={(g, i) => <Animated.View entering={i < 8 ? FadeInUp.delay(i * 30).duration(200) : undefined}><GapRow item={g} done={added.includes(g.key)} canAdd={canAdd} onAdd={() => onAdd(g)} /></Animated.View>}
      empty={{ icon: "check-circle", title: filter === "open" ? t("admAiReg.noGaps") : t("admAiReg.noGapsAll"), text: t("admAiReg.noGapsText") }}
      header={
        <View style={{ gap: 10, marginHorizontal: -16, paddingBottom: 10 }}>
          <View style={{ paddingHorizontal: 16 }}><RegHero /></View>
          <CcTiles value={filter} onChange={(v) => setFilter(v as GapFilter)} options={[{ value: "open", label: t("admAiReg.fOpen"), count: all.filter(isOpenGap).length, alert: true }, { value: "all", label: t("adm.all"), count: filter === "all" ? all.length : undefined }]} />
          <SearchBox value={search} onChangeText={setSearch} placeholder={t("admAiReg.gapsPh")} />
        </View>
      }
    />
  );
}
