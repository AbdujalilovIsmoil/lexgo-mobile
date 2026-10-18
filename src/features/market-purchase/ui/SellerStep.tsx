import { StyleSheet, View } from "react-native";
import { useEligibleSellers, type PackageSeller, type ServicePackage } from "@/entities/package";
import { Button, EmptyState, ErrorView, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SellerCard } from "./SellerCard";

type Props = { pkg: ServicePackage; onPick: (s: PackageSeller) => void };

// Step 1 of a package order: who will do it. Order and eligibility come from the backend; PREMIUM's extended-verification rule is its own text.
export function SellerStep({ pkg, onPick }: Props) {
  const { t } = useT();
  const q = useEligibleSellers(pkg.id, true);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const rule = q.data?.pages[0]?.policy[pkg.tariff] ?? "";
  if (q.isError && !items.length) return <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />;
  return (
    <View style={s.col}>
      <Text variant="small" tone="gray">{t("ntd.pk.pickLead", { tier: pkg.tariff })}</Text>
      {rule ? <Text variant="caption" tone="accent" weight="semibold">{rule}</Text> : null}
      {q.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={78} round={18} />)
        : !items.length ? <EmptyState icon="users" title={t("ntd.pk.noSellers")} text={t("ntd.pk.noSellersText")} compact />
        : items.map((x) => <SellerCard key={x.userId} seller={x} onPress={() => onPick(x)} />)}
      {q.hasNextPage ? <Button title={t("ntd.pk.more")} onPress={() => void q.fetchNextPage()} loading={q.isFetchingNextPage} variant="line" size="sm" /> : null}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 10 } });
