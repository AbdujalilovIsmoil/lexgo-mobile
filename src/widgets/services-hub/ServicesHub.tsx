import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ServiceCardSkeleton, type Service } from "@/entities/service";
import { Button, EmptyState, ErrorView, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SearchRow } from "./SearchRow";
import { useGrid } from "@/shared/lib/useGrid";
import { ServiceCard } from "./ServiceCard";
import { ServicesFilterSheet } from "./ServicesFilterSheet";
import type { Hub } from "./useServicesHub";

// The top of the Services tab: one row with the search field and the filter button (directions, kind, executor, price and sort
// live in the sheet), then the services as a two-column grid of cards. A change of filter swaps the grid with a short fade; a
// card opens the service's own page (`onOpen`).
export function ServicesHub({ hub, onOpen }: { hub: Hub; onOpen: (s: Service) => void }) {
  const { t } = useT();
  const [sheet, setSheet] = useState(false);
  const g = useGrid({ gap: 12 });
  const key = `${hub.q.trim()}|${JSON.stringify(hub.f)}`;
  return (
    <View style={s.col}>
      <SearchRow hub={hub} onFilters={() => setSheet(true)} />
      {hub.loading ? <View style={s.col}>{[0, 1, 2].map((i) => <ServiceCardSkeleton key={i} />)}</View> : hub.error && !hub.rows.length ? <ErrorView error={hub.error} onRetry={hub.retry} compact /> : (
        <>
          <Text variant="small" tone="gray">{t("svh.servicesN", { n: hub.rows.length })}</Text>
          {hub.rows.length ? (
            <Animated.View key={key} entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)} style={[s.grid, g.cell && s.gridWide]} onLayout={g.onLayout}>
              {g.ready ? hub.visible.map((sv, i) => <ServiceCard key={sv.id} service={sv} index={i} cell={g.cell} move={g.move} onPress={() => onOpen(sv)} />) : null}
            </Animated.View>
          ) : <EmptyState icon="search" title={t("svh.noMatch")} text={t("svh.noMatchText")} compact />}
          {hub.left ? <Button title={`${t("svh.more")} · ${hub.left}`} variant="soft" full onPress={hub.more} /> : null}
        </>
      )}
      <ServicesFilterSheet hub={hub} visible={sheet} onClose={() => setSheet(false)} />
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 }, grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }, gridWide: { justifyContent: "flex-start", columnGap: 12 } });
