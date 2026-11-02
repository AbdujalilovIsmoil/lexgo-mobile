import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useMyRating } from "@/entities/lawyer";
import { useJobs } from "@/entities/market-feed";
import { useMyFeatures, usePlans } from "@/entities/plan";
import { useClientProfile } from "@/entities/profile-extras";
import { isCancelled, useEvents } from "@/entities/pro-calendar";
import { useProfileCompleteness } from "@/entities/pro-profile";
import { useRequestCounts, useRequests } from "@/entities/pro-requests";
import { groupTasks, useCabinet } from "@/entities/pro-workspace";
import { secKeys } from "@/entities/security";
import { displayName, useSession } from "@/entities/session";
import { useResync } from "@/shared/realtime";
import { ErrorView, Skeleton } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { useInsets } from "@/shared/lib/insets";
import { fmtRating, isoDay } from "@/shared/lib/format";
import { todayKey } from "@/shared/lib/pro/dates";
import { InfoCards, StatusBanner } from "@/widgets/pro-dashboard";
import { useT } from "@/shared/i18n";
import { ActivityPanel } from "./ActivityPanel";
import { AiCard } from "./AiCard";
import { AssignedAlert } from "./AssignedAlert";
import { BoostCard } from "./BoostCard";
import { HomeQuick } from "./HomeQuick";
import { MetricsPanel } from "./MetricsPanel";
import { NewCases } from "./NewCases";
import { PayoutsPanel } from "./PayoutsPanel";
import { ProfileCard, type CardStat } from "./ProfileCard";
import { ProfileStrengthCard } from "./ProfileStrengthCard";
import { RatingPanel } from "./RatingPanel";
import { ReferralProgress } from "./ReferralProgress";
import { SecurityFold } from "./SecurityFold";
import { NextSteps, StandingCard } from "./StandingCard";
import { TasksPanel } from "./TasksPanel";
import { TodayPanel } from "./TodayPanel";
import { WorkTiles, type WorkTile } from "./WorkTiles";
import { NavyBar } from "@/widgets/tab-page/NavyBar";
import { DIGITAL_SALES } from "@/shared/store-rules";

const KEYS = ["pro-workspace", "lawyer-cabinet", "pro-profile", "seller-rating", "pro-requests", "pro-calendar", "pro-tasks", "pro-cases", "pro-clients", "pro-referral", "pay-referral", "market-feed", [...secKeys.profile]];

// The professional's home (Ish maydoni), the same for an advokat and a yurist. The most important things first:
// the compact navy header → the order or urgent request waiting for an answer → who I am today (plan, the four numbers that matter)
// → the four doors (urgent work, opportunities, calendar, document requests) → today's schedule → where my profile and rating stand
// → the next steps (profile, security). Below them everything the home already had: new orders to accept, my tasks, quick actions,
// recent activity, LexGo AI, referrals, metrics, the rating breakdown, payouts and the advocate's promotion (a yurist: security cards).
// Everything comes from the backend. A seller still being verified sees the verification state and the completeness card.
export function SellerHome({ bottomPad }: { bottomPad: number }) {
  const { t, locale } = useT();
  const qc = useQueryClient();
  const insets = useInsets();
  const session = useSession();
  const advocate = session?.user.role === "advocate";
  const cabinet = useCabinet();
  const refresh = () => KEYS.forEach((k) => void qc.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
  useResync(refresh);
  const c = cabinet.data;
  const counts = useRequestCounts().counts;
  const urgent = useRequests("urgent").data ?? [];
  const jobs = useJobs().data;
  const events = useEvents().data ?? [];
  const rating = useMyRating(true).data;
  const { account } = useProfileCompleteness();
  const features = useMyFeatures().data;
  const plans = usePlans().data;
  const me = useClientProfile().data; // the same plan the profile page shows
  const [today] = useState(() => isoDay());
  const name = displayName(session?.user) || c?.name || "";
  const pad = Math.max(bottomPad, insets.bottom + 24);
  const body = { padding: 16, gap: 14 } as const;
  const role = t(advocate ? "au1.role.advokat" : "au1.role.yurist");

  // The cabinet is not here yet (the first start) or could not be read: the header and placeholders — never the pending seller's layout,
  // which an approved professional used to see for a moment before the real home replaced it.
  if (!c) {
    return (
      <View style={{ flex: 1 }}>
        <NavyBar title={t("tabs.workspace")} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[body, { paddingBottom: pad }]}>
          {cabinet.isError ? <ErrorView error={cabinet.error} onRetry={() => void cabinet.refetch()} compact /> : [0, 1, 2].map((i) => <Skeleton key={i} height={i ? 132 : 190} round={22} />)}
        </ScrollView>
      </View>
    );
  }
  // A seller still being verified: the header stays, then where verification stands.
  if (c.limited) {
    return (
      <View style={{ flex: 1 }}>
        <NavyBar title={t("tabs.workspace")} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[body, { paddingBottom: pad }]}>
          <StatusBanner />
          <ProfileStrengthCard i={0} />
          <InfoCards />
        </ScrollView>
      </View>
    );
  }

  const groups = groupTasks(c.cases, todayKey());
  const todays = events.filter((e) => !isCancelled(e) && e.startsAt && isoDay(new Date(e.startsAt)) === today);
  const dueToday = groups.today.length + todays.filter((e) => e.type.endsWith("_deadline")).length;
  const requests = counts.docs + counts.urgent + counts.orders + counts.meetings;
  const paid = !!features?.active;
  const plan = me?.planName || (paid ? plans?.find((p) => p.id === features?.planId)?.name ?? t("cdash.side.myPlan") : t("shm.ws.freePlan"));
  const stats: CardStat[] = [
    { key: "cases", value: String(groups.today.length + groups.upcoming.length), label: t("shm.dash.statCases"), to: "/pro/cases" },
    { key: "requests", value: String(requests), label: t("shm.ws.statRequests"), to: "/(tabs)/requests" },
    { key: "due", value: String(dueToday), label: t("shm.ws.statDue"), to: "/pro/calendar" },
    { key: "rating", value: rating?.rated ? fmtRating(rating.rating, locale) : t("shm.ws.ratingNew"), label: t("shm.ws.statRating"), to: "/pro/stats" },
  ];
  const n = (v: number, key: string) => (v ? t(key, { n: v }) : t("shm.ws.none"));
  const market: WorkTile = c.actions.acceptOrders
    ? { key: "market", icon: "target", tint: "#1668F0", title: t(advocate ? "lsb.opportunities" : "lsb.marketplace"), sub: jobs ? n(jobs.length, "shm.ws.fresh") : "—", to: "/pro/market", hot: !!jobs?.length }
    : { key: "clients", icon: "users", tint: "#1668F0", title: t("shm.dash.statClients"), sub: n(c.clients, "shm.ws.clientsN"), to: "/(tabs)/clients" };
  const tiles: WorkTile[] = [
    { key: "urgent", icon: "zap", tint: "#E8662E", title: t("lsb.urgentAssigned"), sub: n(counts.urgent, "shm.ws.waiting"), to: "/pro/urgent", hot: counts.urgent > 0 },
    market,
    { key: "calendar", icon: "calendar", tint: "#00A870", title: t("shm.ws.calendar"), sub: n(todays.length, "shm.ws.todayN"), to: "/pro/calendar" },
    { key: "docs", icon: "file-text", tint: "#7A5CFF", title: t("lsb.documentRequests"), sub: n(counts.docs, "shm.ws.count"), to: "/pro/docs", hot: counts.docs > 0 },
  ];
  let k = 0;
  return (
    <View style={{ flex: 1 }}>
      <NavyBar title={t("tabs.workspace")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: pad }}>
        <HeaderExtra />
        <View style={body}>
          <AssignedAlert orders={c.orders} urgent={urgent} />
          <ProfileCard name={name} avatar={account.data?.avatarUrl} kicker={`${role} · ${plan}`} stats={stats} />
          <WorkTiles items={tiles} />
          <View style={{ marginTop: 6 }}><TodayPanel events={events} due={groups.today} i={k++} /></View>
          <StandingCard i={k++} />
          <NextSteps i={k++} />
          {c.orders.length ? <NewCases orders={c.orders} i={k++} /> : null}
          <TasksPanel cases={c.cases} i={k++} />
          <HomeQuick />
          <ActivityPanel notes={c.notes} i={k++} />
          <AiCard i={k++} advocate={advocate} />
          <ReferralProgress i={k++} />
          <MetricsPanel cabinet={c} i={k++} />
          <RatingPanel i={k++} />
          <PayoutsPanel i={k++} />
          {advocate && DIGITAL_SALES ? <BoostCard i={k++} /> : <SecurityFold i={k++} />}
        </View>
      </ScrollView>
    </View>
  );
}
