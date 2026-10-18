import { View } from "react-native";
import { serviceStats, type AdminService, type OverlaidCategory, type StateFilter } from "@/entities/admin-services";
import { SearchBox, SelectField } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ServicesHero } from "./ServicesHero";

type Props = { all: AdminService[]; q: string; onQ: (v: string) => void; cat: string; onCat: (v: string) => void; state: StateFilter; onState: (v: StateFilter) => void; categories: OverlaidCategory[]; count: number; note?: string };

// Hero numbers, search, one category picker (collapsed filter) and active / inactive tiles with counts.
export function ServiceFilters({ all, q, onQ, cat, onCat, state, onState, categories, count, note }: Props) {
  const { t } = useT();
  const cats = [{ value: "", label: t("admSvc.allCats") }, ...categories.filter((c) => !c.hidden).map((c) => ({ value: c.id, label: c.name }))];
  const scoped = serviceStats(cat ? all.filter((s) => s.categoryId === cat) : all);
  const tiles = [{ value: "all", label: t("admSvc.state.all"), count: scoped.total }, { value: "active", label: t("admSvc.state.active"), count: scoped.active }, { value: "inactive", label: t("admSvc.state.inactive"), count: scoped.inactive }];
  return (
    <View style={{ gap: 10, paddingBottom: 12 }}>
      <ServicesHero stats={scoped} />
      <View style={{ marginHorizontal: -16 }}><SearchBox value={q} onChangeText={onQ} placeholder={t("admSvc.searchPh")} /></View>
      <SelectField value={cat} options={cats} onChange={onCat} placeholder={t("admSvc.allCats")} searchable />
      <View style={{ marginHorizontal: -16 }}><CcTiles options={tiles} value={state} onChange={(v) => onState(v as StateFilter)} /></View>
      <Text variant="caption" tone="gray">{t("admSvc.shown", { n: count })}</Text>
      {state === "inactive" ? <Text variant="caption" tone="gray">{t("admSvcC.inactiveNote")}</Text> : null}
      {note ? <Text variant="caption" tone="warn">{note}</Text> : null}
    </View>
  );
}
