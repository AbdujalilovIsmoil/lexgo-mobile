import type { ReactNode } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { usePromoStatus } from "@/entities/promotion";
import type { ProService, ServiceFilter } from "@/entities/pro-service";
import { Button } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";
import { PromoteStrip } from "./PromoteStrip";
import { ServicesHero } from "./ServicesHero";
import { ServicesToolbar } from "./ServicesToolbar";

export type { ServiceFilter };
type Props = {
  before?: ReactNode; // above the hero (the tab switch)
  aboveList?: ReactNode; // slot right under the hero (the location-sharing card)
  rules?: ReactNode; // service-rules banner
  items: ProService[];
  loading?: boolean;
  filter: ServiceFilter;
  onFilter: (f: ServiceFilter) => void;
  search: string;
  onSearch: (s: string) => void;
  verified: boolean;
  boostDays: number | null;
  waiting: number;
  toolbar?: boolean; // search + filter (nothing to search while the list is empty)
  onAdd: () => void;
  onPromoteProfile: () => void;
};

// Everything above the list: tab switch, hero (counters, add), the promote card, the slot, notes, search and filter.
export function ServicesHeader({ before, aboveList, rules, items, loading, filter, onFilter, search, onSearch, verified, boostDays, waiting, toolbar = true, onAdd, onPromoteProfile }: Props) {
  const { t } = useT();
  const router = useRouter();
  const running = usePromoStatus().data?.items ?? [];
  return (
    <View style={{ gap: 14, paddingBottom: 14 }}>
      {before}
      <ServicesHero items={items} loading={loading} filter={filter} onFilter={onFilter} waiting={waiting} running={running.length} onAdd={onAdd} />
      <PromoteStrip onPress={onPromoteProfile} running={running} />
      {aboveList}
      {rules}
      {verified ? null : (
        <View style={{ gap: 8 }}>
          <Notice tone="warn" title={t("proSvc.unverified.title")} text={t("proSvc.unverified.text")} />
          <Button title={t("proSvc.unverified.action")} variant="soft" size="sm" onPress={() => router.push("/pro/onboarding")} />
        </View>
      )}
      {boostDays !== null ? <Notice icon="radio" title={t("proSvc.boost.title")} text={t("proSvc.boost.text", { days: boostDays })} /> : null}
      {toolbar ? <ServicesToolbar items={items} filter={filter} onFilter={onFilter} search={search} onSearch={onSearch} /> : null}
    </View>
  );
}
