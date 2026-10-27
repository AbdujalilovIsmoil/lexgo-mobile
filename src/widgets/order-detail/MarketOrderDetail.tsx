import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { callPath } from "@/entities/call";
import { orderPhase, type MarketOrder } from "@/entities/order";
import { chatModeOf, isPaidStatus, useFlowLive, type FlowPhase } from "@/entities/market-flow";
import { ActiveCallBar } from "@/widgets/secure-chat";
import { ChecklistCard, ComplaintCard, FlowLead, PaymentRequestCard, PaymentsCard, PriceCard, RefundCard, ResolutionCard, WarrantyCard, WorkTimeCard } from "@/widgets/market-order";
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

// The client's read-only checklist from the review stage on (TZ §7.2), through the work, a rework and a cancellation review, to the end.
const CHECKLIST: FlowPhase[] = ["reviewing", "in_progress", "rework", "cancelReview", "attention", "completed", "rated"];

// Body of /orders/[id] for a marketplace purchase: where it stands, what to pay (advance / final), the specialist, the 15-minute rating
// and complaint window, the result, the checklist the specialist works through, the payments, the warranty, then what was bought.
export function MarketOrderDetail({ order, refreshing, onRefresh }: Props) {
  const insets = useInsets();
  const router = useRouter();
  useFlowLive();
  const phase = orderPhase(order);
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
      {/* While the client is to choose, the resolution card below is the lead: the same words twice would only push the buttons down. */}
      {phase === "pending" ? <PendingNote onCheck={onRefresh} checking={refreshing} /> : f.resolution?.canChoose ? null : <FlowLead phase={phase} role="client" lead={phase === "completed" && !order.rating?.available ? "completedClosed" : undefined} message={f.clientStatusMessage} />}
      {live ? <ActiveCallBar roomId={order.roomId} onJoin={(id) => router.push(callPath(order.roomId, id) as never)} style={s.call} /> : null}
      <ResolutionCard orderId={order.id} flow={f} />
      <WorkTimeCard flow={f} phase={phase} role="client" />
      <RefundCard orderId={order.id} enabled={phase === "refund" || phase === "refunded"} />
      <PaymentRequestCard orderId={order.id} flow={f} phase={phase} />
      <AddPayNote order={order} />
      <SellerCard order={order} />
      <RatingBanner order={order} />
      <ComplaintCard orderId={order.id} flow={f} />
      <ResultCard order={order} />
      <ChecklistCard orderId={order.id} url={f.checklistUrl} role="client" enabled={CHECKLIST.includes(phase) || (phase === "paid" && !!f.checklistProgress)} />
      <PaymentsCard orderId={order.id} url={f.financialsUrl} role="client" enabled={phase !== "cancelled" || isPaidStatus(order.paymentStatus)} />
      <WarrantyCard orderId={order.id} flow={f} phase={phase} />
      <SecondOpinionCard order={order} scrolled={scrolled} />
      <PackageCard order={order} />
      {f.pricing ? <PriceCard price={f.pricing} /> : <OptionsCard order={order} />}
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
