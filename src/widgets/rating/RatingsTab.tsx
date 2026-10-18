import { useState } from "react";
import { View } from "react-native";
import { reviewTargetOf, useMyReviews, useOpenWindows, usePendingReviews, type RateTarget } from "@/entities/rating";
import { Divider, EmptyState, Pill, Text } from "@/shared/ui";
import { PagedList } from "@/shared/ui/admin";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";
import { RateSheet } from "./RateSheet";
import { GivenRow, PendingRow } from "./RatingRows";
import { RatingsHero } from "./RatingsHero";

// "Baholar": the average on a hero, the works waiting for a rating (open 15-minute windows first, then finished jobs) as
// flat rows that open a rating sheet, and the ratings already given.
export function RatingsTab() {
  const { t } = useT();
  const mine = useMyReviews();
  const open = useOpenWindows().data ?? [];
  const pending = usePendingReviews().data ?? [];
  const [pick, setPick] = useState<RateTarget | null>(null);
  const given = mine.data ?? [];
  const { items, query } = useSlicedList(given, mine, "mine");
  const waiting: RateTarget[] = [...open, ...pending.map(reviewTargetOf)];
  const avg = given.length ? given.reduce((n, r) => n + r.stars, 0) / given.length : 0;
  return (
    <>
      <PagedList
        data={items}
        query={query}
        flat
        keyExtractor={(r) => r.id}
        renderItem={(r) => <GivenRow r={r} />}
        empty={{ icon: "star", title: t("pwr.rv.noMine"), text: t("pwr.rv.noMineText") }}
        header={
          <View>
            <RatingsHero avg={avg} count={given.length} waiting={waiting.length} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Text variant="h4">{t("pwr.rv.pendingTitle")}</Text>{waiting.length ? <Pill label={String(waiting.length)} tone="warn" small /> : null}</View>
            {waiting.length ? waiting.map((x, i) => <View key={x.workId + x.recordId}>{i ? <Divider inset={58} /> : null}<PendingRow target={x} onRate={setPick} /></View>) : <EmptyState compact icon="star" title={t("pwr.rv.noPending")} text={t("pwr.rv.noPendingText")} />}
            <Text variant="h4" style={{ marginTop: 14 }}>{t("pwr.rv.mineTitle")}</Text>
          </View>
        }
      />
      <RateSheet target={pick} onClose={() => setPick(null)} />
    </>
  );
}
