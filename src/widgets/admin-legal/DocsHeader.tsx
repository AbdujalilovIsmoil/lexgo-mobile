import { View } from "react-native";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import type { DocSlot, DocState } from "@/entities/admin-legal";
import { useT } from "@/shared/i18n";
import { LegalHero } from "./LegalHero";

export type DocFilter = "" | DocState;

type Props = { slots: DocSlot[]; filter: DocFilter; onFilter: (f: DocFilter) => void; q: string; onQ: (v: string) => void };

// Top of the documents tab: hero numbers, state tiles with counts and a name / code search.
export function DocsHeader({ slots, filter, onFilter, q, onQ }: Props) {
  const { t } = useT();
  const n = (s: DocState) => slots.filter((x) => x.state === s).length;
  return (
    <View style={{ gap: 10, marginHorizontal: -16, paddingBottom: 10 }}>
      <View style={{ paddingHorizontal: 16 }}><LegalHero slots={slots} /></View>
      <CcTiles value={filter} onChange={(v) => onFilter(v as DocFilter)} options={[{ value: "", label: t("adm.all"), count: slots.length }, { value: "ready", label: t("admLegal.state.ready"), count: n("ready") }, { value: "placeholder", label: t("admLegal.state.placeholder"), count: n("placeholder"), alert: true }, { value: "missing", label: t("admLegal.state.missing"), count: n("missing"), alert: true }]} />
      <SearchBox value={q} onChangeText={onQ} placeholder={t("admLegalC.searchPh")} />
    </View>
  );
}
