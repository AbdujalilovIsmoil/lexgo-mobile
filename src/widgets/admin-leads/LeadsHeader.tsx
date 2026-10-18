import { View } from "react-native";
import { Button, Segmented, Text } from "@/shared/ui";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { EMPTY_FILTER, type LeadFilter } from "@/entities/admin-leads";
import { KpiStrip } from "./KpiStrip";

type Props = {
  stats: { total: number; active: number; won: number; conv: number };
  filter: LeadFilter;
  onFilter: (f: LeadFilter) => void;
  stage: string;
  onStage: (key: string) => void;
  options: { value: string; label: string; count: number }[];
  filtered: boolean;
  matched: number;
  mode: "board" | "list";
  onMode: (m: "board" | "list") => void;
};

// Top of the lead list: KPIs, search, stage chips (each with its lead count) and the filter summary.
export function LeadsHeader({ stats, filter, onFilter, stage, onStage, options, filtered, matched, mode, onMode }: Props) {
  const { t } = useT();
  const all = { value: "", label: t("adm.all"), count: filtered ? matched : stats.total };
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <KpiStrip stats={stats} />
      <Segmented options={[{ value: "board", label: t("admLeadsV.board"), icon: "layers" }, { value: "list", label: t("admLeadsV.list"), icon: "list" }]} value={mode} onChange={onMode} />
      <View style={{ marginHorizontal: -16 }}>
        <SearchBox value={filter.q} onChangeText={(q) => onFilter({ ...filter, q })} placeholder={t("admLeads.searchPh")} />
      </View>
      {mode === "list" ? (
        <View style={{ marginHorizontal: -16 }}>
          <ChipBar options={[all, ...options]} value={stage} onChange={onStage} />
        </View>
      ) : null}
      {filtered ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="small" tone="gray">{t("admLeads.shown", { n: matched, total: stats.total })}</Text>
          <Button title={t("adm.reset")} variant="ghost" size="sm" icon="x" onPress={() => onFilter(EMPTY_FILTER)} />
        </View>
      ) : null}
    </View>
  );
}
