import { View } from "react-native";
import { Button, Input, Text } from "@/shared/ui";
import { MultiChips, SwitchField } from "@/shared/ui/admin";
import { useCcLabel } from "@/entities/admin-callcenter";
import { useT } from "@/shared/i18n";
import { DIRECTION_SLUGS } from "../model/directions";
import type { CandidateSource } from "../model/useCandidateSource";

// Who to list: external advocates / the duty desk, or a wider search by area and region.
export function CandidateFilters({ src }: { src: CandidateSource }) {
  const { t } = useT();
  const label = useCcLabel();
  return (
    <View style={{ gap: 12 }}>
      {src.wide ? (
        <>
          <Text variant="small" tone="gray">{t("admCc.searchWideLead")}</Text>
          <MultiChips options={DIRECTION_SLUGS.map((d) => ({ value: d, label: label("admCc.dir", d) }))} value={src.dirs} onChange={src.setDirs} />
          <Input value={src.region} onChangeText={src.setRegion} placeholder={t("admCc.regionPh")} />
          <Button title={t("adm.search")} icon="search" variant="soft" size="sm" onPress={src.apply} />
        </>
      ) : (
        <>
          <SwitchField label={t("admCc.includeExternal")} value={src.external} onChange={src.setExternal} />
          <SwitchField label={t("admCc.includeCallcenter")} value={src.callcenter} onChange={src.setCallcenter} />
        </>
      )}
      <Button title={src.wide ? t("admCc.searchNarrow") : t("admCc.searchWide")} icon="sliders" variant="line" size="sm" onPress={() => src.setWide(!src.wide)} />
    </View>
  );
}
