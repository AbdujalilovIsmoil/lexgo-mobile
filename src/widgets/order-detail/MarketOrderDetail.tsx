import { useRef, useState } from "react";
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
import { SecondOpinionCard } from "./SecondOpinionCard";
import { ResultCard } from "./ResultCard";
import { SellerCard } from "./SellerCard";

type Props = { order: MarketOrder; refreshing: boolean; onRefresh: () => void };

// Body of /orders/[id] for a marketplace purchase.
export function MarketOrderDetail({ order, refreshing, onRefresh }: Props) {
  const insets = useInsets();
  // Bumped while the page scrolls (and when it settles): the second-opinion card asks again whether it is on screen.
  const [tick, setTick] = useState(0);
  const last = useRef(0);
  const bump = () => { const now = Date.now(); if (now - last.current > 150) { last.current = now; setTick((n) => n + 1); } };
  return (
    <ScrollView
      onScroll={bump}
      onMomentumScrollEnd={() => setTick((n) => n + 1)}
      onScrollEndDrag={() => setTick((n) => n + 1)}
      scrollEventThrottle={100}
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
      <SecondOpinionCard order={order} tick={tick} />
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
