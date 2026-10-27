import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { forViewer, isAiPlan, isGiftPlan, orderPlans, PlanCardSkeleton, termPeriod, useEntitlements, usePlans, viewerOf, type Term } from "@/entities/plan";
import { useClientProfile } from "@/entities/profile-extras";
import { useIsAuthed, useSession } from "@/entities/session";
import { useChoosePlan } from "@/features/choose-plan";
import { AiPlansSection, AutopayPanel, Benefits, BillingHistory, CompareTable, FaqList, MyPlanCard, OtherPlansSection, PendingRequests, TelegramRequestSheet, TopCards } from "@/widgets/subscription";
import { EmptyState, ErrorView, Header, Screen } from "@/shared/ui";
import { useRaPage, useRaScroller } from "@/shared/remote-assist";
import { useT } from "@/shared/i18n";

// Client tariffs, in the order of the web page: current state and "my plan" (TZ §12), auto-pay, LexGo.AI, benefits,
// comparison, FAQ, other tariffs + gift, billing history. Checkout (pay / Telegram) is a sheet.
// Remote assistance (`client.subscription`): the term switches, the tariff cards and their choose buttons are on the operator's map.
export function SubscriptionPage() {
  const c = useColors();
  const { t } = useT();
  useRaPage("client.subscription");
  const { view, anchor } = useRaScroller();
  const { data, isLoading, error, refetch, isRefetching } = usePlans();
  const ent = useEntitlements();
  const ch = useChoosePlan();
  const signedIn = useIsAuthed();
  const [term, setTerm] = useState<Term>(1);
  const [upfront, setUpfront] = useState(false);
  // Each person sees the plans meant for them (contract §21); the gift plan keeps its own card, from the whole list.
  const viewer = viewerOf(useSession()?.user.role);
  const sellable = orderPlans((data ?? []).filter((p) => !isGiftPlan(p) && forViewer(p, viewer)), () => true);
  const ai = sellable.filter(isAiPlan);
  const other = sellable.filter((p) => !isAiPlan(p));
  const cur = useClientProfile().data?.planName;
  // Web rule (PlansPanel): a card is "current" only when its name equals the subscription name of GET /clients/me.
  const active = (data ?? []).filter((p) => !!cur && p.name === cur).map((p) => p.id);
  const refresh = () => void Promise.all([refetch(), ent.refetch()]);
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <Header title={t("profile.subscription")} />
      <Screen {...view} topInset={false} refreshing={isRefetching} onRefresh={refresh} contentContainerStyle={s.content}>
        <View {...anchor} />
        {signedIn ? <TopCards /> : null}
        {signedIn ? <MyPlanCard /> : null}
        {signedIn && ent.data ? <PendingRequests items={ent.data.pending} /> : null}
        {signedIn ? <AutopayPanel /> : null}
        {error ? <ErrorView error={error} onRetry={() => void refetch()} /> : isLoading ? [0, 1].map((i) => <PlanCardSkeleton key={i} />) : (
          <>
            {ai.length ? <AiPlansSection plans={ai} term={term} upfront={upfront} activeIds={active} onTerm={setTerm} onUpfront={setUpfront} onChoose={(p) => ch.choose(p, termPeriod(term, upfront))} /> : <EmptyState icon="credit-card" title={t("cs.empty")} text={t("cs.emptyText")} />}
            <Benefits />
            {ai.length ? <CompareTable plans={ai} /> : null}
            {ai.length ? <FaqList /> : null}
            <OtherPlansSection plans={other} all={data ?? []} activeIds={active} onChoose={(p, tm, up) => ch.choose(p, termPeriod(tm, up))} />
          </>
        )}
        {signedIn ? <BillingHistory /> : null}
      </Screen>
      <TelegramRequestSheet plan={ch.picked} period={ch.period} onClose={ch.closePicked} />
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { gap: 14, paddingTop: 6 },
});
