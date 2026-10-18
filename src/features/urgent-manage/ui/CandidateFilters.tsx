import { View } from "react-native";
import { Button, Input, Text } from "@/shared/ui";
import { MultiChips, SwitchField } from "@/shared/ui/admin";
import { STAFF_DIRECTIONS } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import type { CandidateSource } from "../model/useCandidateSource";

// Who to list: external advocates / the duty desk, or a wider search by area and region.
export function CandidateFilters({ src }: { src: CandidateSource }) {
  const { t } = useT();
  return (
    <View style={{ gap: 12 }}>
      {src.wide ? (
        <>
          <Text variant="small" tone="gray">{t("ug9.wideLead")}</Text>
          <MultiChips options={STAFF_DIRECTIONS.map((d) => ({ value: d, label: t(`ug4.dir.${d}`) }))} value={src.dirs} onChange={src.setDirs} />
          <Input value={src.region} onChangeText={src.setRegion} placeholder={t("ug9.regionPh")} />
          <Button title={t("adm.search")} icon="search" variant="soft" size="sm" onPress={src.apply} />
        </>
      ) : (
        <>
          <SwitchField label={t("ug9.includeExternal")} value={src.external} onChange={src.setExternal} />
          <SwitchField label={t("ug9.includeDuty")} value={src.callcenter} onChange={src.setCallcenter} />
        </>
      )}
      <Button title={t(src.wide ? "ug9.narrow" : "ug9.wide")} icon="sliders" variant="line" size="sm" onPress={() => src.setWide(!src.wide)} />
    </View>
  );
}
