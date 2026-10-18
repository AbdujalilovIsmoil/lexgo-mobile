import { StyleSheet, View } from "react-native";
import { ServiceCard, ServiceCardSkeleton, useServicePages, type Service } from "@/entities/service";
import { Button, EmptyState, ErrorView } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { cat: string; sub: string; q: string; onPick: (s: Service) => void };

// Server-paged service cards: skeleton on every new search/filter, "Show more"
// appends the next page.
export function DirectionList({ cat, sub, q, onPick }: Props) {
  const { t } = useT();
  const { data, isPending, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useServicePages(cat, sub, q);
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} compact />;
  if (isPending) return <View style={s.col}>{[0, 1, 2, 3].map((i) => <ServiceCardSkeleton key={i} />)}</View>;
  const items = data.pages.flat();
  if (!items.length) return <EmptyState icon="search" title={t("svc.noResults")} compact />;
  return (
    <View style={s.col}>
      {items.map((sv) => <ServiceCard key={sv.id} service={sv} onPress={() => onPick(sv)} />)}
      {hasNextPage ? <Button title={t("svc.showMore")} onPress={() => void fetchNextPage()} loading={isFetchingNextPage} variant="soft" full /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
});
