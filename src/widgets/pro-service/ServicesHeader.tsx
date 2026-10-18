import { View } from "react-native";
import { useRouter } from "expo-router";
import { countBy, type ProService, type ServiceStatus } from "@/entities/pro-service";
import { Button } from "@/shared/ui";
import { ChipBar, KpiGrid, KpiTile, SearchBox } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

export type ServiceFilter = "all" | ServiceStatus;
type Props = { items: ProService[]; filter: ServiceFilter; onFilter: (f: ServiceFilter) => void; search: string; onSearch: (s: string) => void; verified: boolean; boostDays: number | null };

// Counters, the "not verified yet" / "profile boosted" notes, status filter and search for the services list.
export function ServicesHeader({ items, filter, onFilter, search, onSearch, verified, boostDays }: Props) {
  const { t } = useT();
  const router = useRouter();
  const n = countBy(items);
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <KpiGrid>
        <KpiTile label={t("sl6.kpi.active")} value={String(n.active)} icon="play" tint="#22C55E" onPress={() => onFilter("active")} />
        <KpiTile label={t("sl6.kpi.promoted")} value={String(n.promoted)} icon="radio" tint="#06B6D4" />
      </KpiGrid>
      {verified ? null : (
        <View style={{ gap: 8 }}>
          <Notice tone="warn" title={t("sl6.unverified.title")} text={t("sl6.unverified.text")} />
          <Button title={t("sl6.unverified.go")} variant="soft" size="sm" onPress={() => router.push("/pro/onboarding")} />
        </View>
      )}
      {boostDays !== null ? <Notice icon="radio" text={t("sl6.boost", { n: boostDays })} /> : null}
      <ChipBar value={filter} onChange={onFilter} options={[
        { value: "all", label: t("adm.all"), count: n.all },
        { value: "active", label: t("sl6.status.active"), count: n.active },
        { value: "paused", label: t("sl6.status.paused"), count: n.paused },
        { value: "inactive", label: t("sl6.status.inactive"), count: n.inactive },
      ]} />
      <SearchBox value={search} onChangeText={onSearch} placeholder={t("sl6.search")} />
    </View>
  );
}
