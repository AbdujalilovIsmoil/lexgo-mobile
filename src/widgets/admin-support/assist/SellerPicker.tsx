import { View } from "react-native";
import { PickRow, useSupportLabels, type Seller } from "@/entities/admin-support";
import { Button, Icon, Input, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useSum } from "./useSum";
import type { useMarketFlow } from "./useMarketFlow";

type Flow = ReturnType<typeof useMarketFlow>;

// Search the LexGo-verified sellers and pick one; the chosen seller collapses into a single row.
export function SellerPicker({ f }: { f: Flow }) {
  const { t } = useT();
  const sum = useSum();
  const labels = useSupportLabels();
  const meta = (s: Seller) => [labels.role(s.sellerType), s.rating > 0 ? `★ ${s.rating.toFixed(1)}` : "", s.servicesCount ? t("admSupC.market.services", { n: s.servicesCount }) : "", s.priceFrom ? t("admSupC.market.from", { amount: sum(s.priceFrom) }) : ""].filter(Boolean).join(" · ");
  if (f.seller) return <PickRow selected title={f.seller.name} hint={meta(f.seller)} right={t("admSupC.doc.change")} onPress={() => f.pickSeller(null)} />;
  if (f.isPkg && !f.pkg) return <Text variant="small" tone="gray">{t("ntd.ccV2.market.pickPkgFirst")}</Text>;
  return (
    <View style={{ gap: 8 }}>
      {f.isPkg ? null : <Input value={f.v.q} onChangeText={(q) => f.set({ q })} placeholder={t("admSupC.market.sellerPh")} maxLength={120} autoCapitalize="none" autoCorrect={false} left={<Icon name="search" size={18} tone="gray" />} />}
      {f.sellers.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} height={56} round={14} />) : null}
      {f.sellers.isError ? <Button title={t("common.retry")} variant="soft" size="sm" onPress={() => void f.sellers.refetch()} /> : null}
      {(f.sellers.data ?? []).map((s) => <PickRow key={s.userId} title={s.name} hint={meta(s)} onPress={() => f.pickSeller(s)} />)}
      {f.sellers.isSuccess && !f.sellers.data.length ? <Text variant="small" tone="gray">{t(f.isPkg ? "ntd.ccV2.market.noEligible" : "admSupC.market.noSellers")}</Text> : null}
    </View>
  );
}
