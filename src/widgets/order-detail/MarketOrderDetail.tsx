import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import type { MarketOrder } from "@/entities/order";
import { marketStageOf } from "@/entities/order";
import { useInsets } from "@/shared/lib/insets";
import { DetailHeader } from "./DetailHeader";
import { OrderFacts } from "./OrderFacts";
import { OrderTimeline } from "./OrderTimeline";
import { PendingNote } from "./PendingNote";
import { AddPayNote } from "./AddPayNote";
import { OptionsCard } from "./OptionsCard";
import { PackageCard } from "./PackageCard";
import { RatingBanner } from "./RatingBanner";
import { ResultCard } from "./ResultCard";
import { SellerCard } from "./SellerCard";

type Props = { order: MarketOrder; refreshing: boolean; onRefresh: () => void };

// Body of /orders/[id] for a marketplace purchase.
export function MarketOrderDetail({ order, refreshing, onRefresh }: Props) {
  const insets = useInsets();
  return (
    <ScrollView
      contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 24 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <DetailHeader order={order} />
      {marketStageOf(order) === "pending" ? <PendingNote onCheck={onRefresh} checking={refreshing} /> : null}
      <AddPayNote order={order} />
      <SellerCard order={order} />
      <RatingBanner order={order} />
      <ResultCard order={order} />
      <PackageCard order={order} />
      <OptionsCard order={order} />
      <OrderFacts order={order} />
      <View style={s.tl}><OrderTimeline order={order} /></View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14, paddingTop: 4 },
  tl: { marginTop: 4 },
});
