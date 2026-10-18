import { View } from "react-native";
import { STATUSES, useRegLabels, type Reglament } from "@/entities/admin-aireg";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { CcFilterBox, CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { RegHero } from "./RegHero";

type Props = { items: Reglament[]; present: string[]; search: string; onSearch: (v: string) => void; cat: string; onCat: (v: string) => void; st: string; onSt: (v: string) => void };

// Status tiles with counts, the search box, and the category chips folded behind one "Filters" row.
export function RegFilters({ items, present, search, onSearch, cat, onCat, st, onSt }: Props) {
  const { t } = useT();
  const l = useRegLabels();
  const n = (f: (r: Reglament) => boolean) => items.filter(f).length;
  return (
    <View style={{ gap: 10, paddingBottom: 10 }}>
      <View style={{ paddingHorizontal: 16 }}><RegHero /></View>
      <CcTiles value={st} onChange={onSt} options={[{ value: "", label: t("adm.all"), count: items.length }, ...STATUSES.map((s) => ({ value: s as string, label: t(`admAiReg.status.${s}`), count: n((r) => r.status === s) }))]} />
      <SearchBox value={search} onChangeText={onSearch} placeholder={t("admAiReg.searchPh")} />
      <View style={{ paddingHorizontal: 16 }}>
        <CcFilterBox active={cat ? 1 : 0} summary={cat ? `${t("admAiRegD.filters")} · ${l.cat(cat)}` : undefined}>
          <ChipBar options={[{ value: "", label: t("adm.all") }, ...present.map((c) => ({ value: c, label: l.cat(c), count: n((r) => r.category === c) }))]} value={cat} onChange={onCat} />
        </CcFilterBox>
      </View>
    </View>
  );
}
