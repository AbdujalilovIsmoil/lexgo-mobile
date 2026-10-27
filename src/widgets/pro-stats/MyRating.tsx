import type { UseQueryResult } from "@tanstack/react-query";
import type { MyRating as MyRatingData } from "@/entities/lawyer";
import { useT } from "@/shared/i18n";
import { MyRatingView } from "@/widgets/rating-breakdown";
import { Card, PressableScale, Skeleton, Text } from "@/shared/ui";
import { Block } from "./Block";

// "Mening reytingim" on the stats page: the seller's own rating v3 (one cached read, never polled). Nothing while the backend has none (404).
export function MyRating({ q }: { q: UseQueryResult<MyRatingData | null> }) {
  const { t } = useT();
  if (!q.isLoading && !q.data && !q.isError) return null;
  return (
    <Block title={t("rt3.title")}>
      <Card style={{ gap: 12, padding: 16 }}>
        {q.isLoading ? (
          <><Skeleton width="40%" height={24} /><Skeleton height={8} /><Skeleton height={8} /></>
        ) : q.data ? <MyRatingView data={q.data} /> : (
          <PressableScale onPress={() => void q.refetch()} accessibilityRole="button" hitSlop={8}>
            <Text variant="small" tone="gray">{t("rt3.failed")} · <Text variant="small" weight="bold" tone="accent">{t("common.retry")}</Text></Text>
          </PressableScale>
        )}
      </Card>
    </Block>
  );
}
