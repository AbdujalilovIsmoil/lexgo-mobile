import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { callPath } from "@/entities/call";
import type { MarketOrder } from "@/entities/order";
import { chatModeOf, phaseOf, useFlowLive } from "@/entities/market-flow";
import { ActiveCallBar } from "@/widgets/secure-chat";
import { ChecklistCard, ComplaintCard, FlowLead, PaymentRequestCard, PaymentsCard, WarrantyCard } from "@/widgets/market-order";
import { useInsets } from "@/shared/lib/insets";
import { createSignal } from "@/shared/lib/signal";
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

// Body of /orders/[id] for a marketplace purchase: where it stands, what to pay (advance / final), the specialist, the 15-minute rating
// and complaint window, the result, the checklist the specialist works through, the payments, the warranty, then what was bought.
export function MarketOrderDetail({ order, refreshing, onRefresh }: Props) {
  const insets = useInsets();
  const router = useRouter();
  useFlowLive();
  const phase = phaseOf({ status: order.status, paymentStatus: order.paymentStatus, flow: order.flow, rated: order.ratingStars > 0 });
  const live = chatModeOf(order, phase) === "open";
  const f = order.flow;
  // Fired while the page scrolls (and when it settles): the second-opinion card asks again whether it is on screen. A signal, not state:
  // a state bump re-rendered every card of the page every 150 ms of scrolling.
  const [scrolled] = useState(createSignal);
  return (
    <ScrollView
      onScroll={scrolled.emit}
      onMomentumScrollEnd={scrolled.emit}
      onScrollEndDrag={scrolled.emit}
      scrollEventThrottle={100}
      contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 24 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <DetailHeader order={order} />
      {phase === "pending" ? <PendingNote onCheck={onRefresh} checking={refreshing} /> : <FlowLead phase={phase} role="client" lead={phase === "completed" && !order.rating?.available ? "completedClosed" : undefined} />}
      {live ? <ActiveCallBar roomId={order.roomId} onJoin={(id) => router.push(callPath(order.roomId, id) as never)} style={s.call} /> : null}
      <PaymentRequestCard orderId={order.id} flow={f} phase={phase} />
      <AddPayNote order={order} />
      <SellerCard order={order} />
      <RatingBanner order={order} />
      <ComplaintCard orderId={order.id} flow={f} />
      <ResultCard order={order} />
      <ChecklistCard orderId={order.id} url={f.checklistUrl} role="client" enabled={phase === "in_progress" || phase === "review" || phase === "completed" || phase === "rated" || (phase === "paid" && !!f.checklistProgress)} />
      <PaymentsCard orderId={order.id} url={f.financialsUrl} role="client" enabled={phase !== "cancelled" || order.paymentStatus === "paid"} />
      <WarrantyCard orderId={order.id} flow={f} phase={phase} />
      <SecondOpinionCard order={order} scrolled={scrolled} />
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
  call: { borderRadius: 14 },
});
