import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { filterIntegrations, groupByCategory, ResidencyCard, useIntegrations } from "@/entities/admin-integrations";
import { IntegrationFilters, IntegrationGroupCard, IntegrationHero } from "@/widgets/admin-integrations";
import { PagedList } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// Third-party services grouped by category: hero numbers, residency card, search and health tiles on top.
export function ServicesTab() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [tone, setTone] = useState("all");
  const query = useIntegrations();
  const all = useMemo(() => query.data?.items ?? [], [query.data]);
  const word = useDebounced(q, 250);
  const groups = useMemo(() => groupByCategory(filterIntegrations(all, tone, word)), [all, tone, word]);
  return (
    <PagedList
      data={groups}
      query={query}
      keyExtractor={(g) => g.category || "_"}
      renderItem={(g, i) => <Animated.View entering={FadeInUp.delay(Math.min(i, 6) * 50).duration(260)}><IntegrationGroupCard group={g} /></Animated.View>}
      skeletonHeight={120}
      off={{ title: t("admIntB.off"), text: t("admIntB.offText") }}
      empty={{ icon: "zap", title: all.length ? t("admIntB.noMatch") : t("admInt.empty") }}
      header={
        <View style={{ gap: 12, paddingBottom: 12 }}>
          <IntegrationHero items={all} />
          <ResidencyCard residency={query.data?.residency ?? null} />
          <IntegrationFilters items={all} q={q} onQ={setQ} tone={tone} onTone={setTone} />
          <Text variant="caption" tone="gray2" center>{t("admInt.lockHint")}</Text>
        </View>
      }
    />
  );
}
