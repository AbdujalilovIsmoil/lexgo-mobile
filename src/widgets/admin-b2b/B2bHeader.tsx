import { View } from "react-native";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { STAGES, stageLabel, type B2bClient } from "@/entities/admin-b2b";
import { B2bHero } from "./B2bHero";

type Props = { clients: B2bClient[]; search: string; onSearch: (v: string) => void; stage: string; onStage: (v: string) => void };

// Hero with the funnel, a search box and one tile per stage that has clients (count on top).
export function B2bHeader({ clients, search, onSearch, stage, onStage }: Props) {
  const { t } = useT();
  const stages = [...STAGES.filter((s) => clients.some((c) => c.stage === s)), ...[...new Set(clients.map((c) => c.stage))].filter((s) => !STAGES.includes(s))];
  const options = [{ value: "", label: t("adm.all"), count: clients.length }, ...stages.map((s) => ({ value: s, label: stageLabel(t, s), count: clients.filter((c) => c.stage === s).length }))];
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <B2bHero clients={clients} />
      <View style={{ marginHorizontal: -16 }}><SearchBox value={search} onChangeText={onSearch} placeholder={t("admB2b.searchPh")} /></View>
      <View style={{ marginHorizontal: -16 }}><CcTiles options={options} value={stage} onChange={onStage} /></View>
    </View>
  );
}
