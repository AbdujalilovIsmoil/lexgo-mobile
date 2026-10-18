import { View } from "react-native";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { adLabel, usedStatuses, type Ad } from "@/entities/admin-ads";
import { useT } from "@/shared/i18n";
import { AdsHero } from "./AdsHero";

type Props = { ads: Ad[]; search: string; onSearch: (v: string) => void; status: string; onStatus: (v: string) => void };

// Lead line, hero, search box and one tile per status that occurs (count on top).
export function AdsHeader({ ads, search, onSearch, status, onStatus }: Props) {
  const { t } = useT();
  const options = [{ value: "", label: t("adm.all"), count: ads.length }, ...usedStatuses(ads).map((s) => ({ value: s, label: adLabel(t, "status", s), count: ads.filter((a) => a.status === s).length }))];
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <Text variant="small" tone="gray">{t("admAds.lead")}</Text>
      <AdsHero ads={ads} />
      <View style={{ marginHorizontal: -16 }}><SearchBox value={search} onChangeText={onSearch} placeholder={t("admAdsB.searchPh")} /></View>
      <View style={{ marginHorizontal: -16 }}><CcTiles options={options} value={status} onChange={onStatus} /></View>
    </View>
  );
}
