import { StyleSheet, View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { Bleed } from "./Bleed";

type Props = { q: string; onQ: (v: string) => void; active: boolean; onFilters: () => void; shown: number; stages: { value: string; label: string; count: number }[]; stage: string; onStage: (v: string) => void };

// Board controls: search, the filter sheet, the "shown" counter and one chip per stage.
export function BoardHeader({ q, onQ, active, onFilters, shown, stages, stage, onStage }: Props) {
  const { t } = useT();
  return (
    <View style={s.col}>
      <Bleed><SearchBox value={q} onChangeText={onQ} placeholder={t("admCcB.boardSearch")} /></Bleed>
      <View style={s.row}>
        <Button title={`${t("adm.filters")}${active ? " •" : ""}`} icon="sliders" size="sm" variant="line" onPress={onFilters} />
        <Text variant="caption" tone="gray">{t("admCcB.shownN", { n: shown })}</Text>
      </View>
      <Bleed><CcTiles options={[{ value: "", label: t("adm.all"), count: stages.reduce((n, c) => n + c.count, 0) }, ...stages]} value={stage} onChange={onStage} /></Bleed>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10, paddingBottom: 12 }, row: { flexDirection: "row", alignItems: "center", gap: 8 } });
