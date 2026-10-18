import { View } from "react-native";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { categoriesOf, type Template } from "@/entities/admin-templates";
import { useT } from "@/shared/i18n";
import { TemplatesHero } from "./TemplatesHero";

type Props = { list: Template[]; search: string; onSearch: (v: string) => void; state: string; onState: (v: string) => void; category: string; onCategory: (v: string) => void; shown: number };

// Hero, search, live/draft tiles and (when there is more than one) category tiles, plus the result counter.
export function TemplatesHeader({ list, search, onSearch, state, onState, category, onCategory, shown }: Props) {
  const { t } = useT();
  const live = list.filter((d) => d.isActive).length;
  const states = [{ value: "", label: t("adm.all"), count: list.length }, { value: "active", label: t("admTplC.live"), count: live }, { value: "draft", label: t("admTplC.draft"), count: list.length - live }];
  const cats = categoriesOf(list);
  const catTiles = [{ value: "", label: t("adm.all"), count: list.length }, ...cats.map((c) => ({ value: c, label: t(`admTpl.cats.${c}`) === `admTpl.cats.${c}` ? c : t(`admTpl.cats.${c}`), count: list.filter((d) => d.category === c).length }))];
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <TemplatesHero list={list} />
      <View style={{ marginHorizontal: -16 }}><SearchBox value={search} onChangeText={onSearch} placeholder={t("admTpl.searchPh")} /></View>
      <View style={{ marginHorizontal: -16 }}><CcTiles options={states} value={state} onChange={onState} /></View>
      {cats.length > 1 ? <View style={{ marginHorizontal: -16 }}><CcTiles options={catTiles} value={category} onChange={onCategory} /></View> : null}
      <Text variant="caption" tone="gray">{t("admTpl.shown", { n: shown })}</Text>
    </View>
  );
}
