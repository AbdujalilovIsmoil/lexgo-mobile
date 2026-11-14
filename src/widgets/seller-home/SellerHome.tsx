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
import { isDone, useTasks } from "@/entities/pro-tasks";
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
import { Briefcase, CalendarClock, MessageSquareText, SquareCheckBig, Star, Target, Users, Zap } from "lucide-react-native";
import { AiCard } from "./AiCard";
import { AssignedAlert } from "./AssignedAlert";
import { Chances } from "./Chances";
import { HeroCard, type HeroStat } from "./HeroCard";
import { ProfileStrengthCard } from "./ProfileStrengthCard";
import { QuickTiles } from "./QuickTiles";
import { StandingRing } from "./StandingRing";
import { TodayList } from "./TodayList";
import { WorkCards, type WorkCard } from "./WorkCards";
import { NavyBar } from "@/widgets/tab-page/NavyBar";

const KEYS = ["pro-workspace", "lawyer-cabinet", "pro-profile", "seller-rating", "pro-requests", "pro-calendar", "pro-tasks", "pro-cases", "pro-clients", "pro-referral", "pay-referral", "market-feed", [...secKeys.profile]];

// The professional's home (Ish maydoni), the same for an advokat and a yurist, in the approved mock's order: the compact navy header →
// the order or urgent request waiting for an answer → the hero card (who I am today: role · plan, the four numbers that matter) →
// "Tezkor amallar" (new client, new case, upload, meeting) → two big doors (Tezkor ishlar; an advokat's tasks, a yurist's order feed) →
// "Bugun" (today's schedule) → "Profil va reyting" (completeness ring, rating) → "Mening imkoniyatlarim" (profile, security, payout) →
// LexGo AI. Everything comes from the backend. A seller still being verified sees the verification state and the completeness card.
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
  // An advokat's home has no opportunities feed (the tasks door stands there) and is not a client: neither the feed nor the client's own
  // record (/clients/me) is asked for here.
  const jobs = useJobs(!advocate).data;
  const tasks = useTasks(advocate).data;
  const events = useEvents().data ?? [];
  const rating = useMyRating(true).data;
  const { account } = useProfileCompleteness();
  const features = useMyFeatures().data;
  const plans = usePlans().data;
  const me = useClientProfile(!advocate).data; // the same plan the profile page shows (a yurist; an advokat's plan comes from the features)
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
  const stats: HeroStat[] = [
    { key: "cases", icon: Briefcase, value: String(groups.today.length + groups.upcoming.length), label: t("shm.dash.statCases"), to: "/pro/cases" },
    { key: "requests", icon: MessageSquareText, value: String(requests), label: t("shm.ws.statRequests"), to: "/(tabs)/requests" },
    { key: "due", icon: CalendarClock, value: String(dueToday), label: t("shm.ws.statDue"), to: "/pro/calendar" },
    { key: "rating", icon: Star, value: rating?.rated ? fmtRating(rating.rating, locale) : t("shm.ws.ratingNew"), label: t("shm.ws.statRating"), to: "/pro/stats" },
  ];
  const n = (v: number, key: string) => (v ? t(key, { n: v }) : t("shm.ws.none"));
  const open = tasks?.filter((x) => !isDone(x)) ?? [];
  const second: WorkCard = advocate
    ? { key: "tasks", icon: SquareCheckBig, tint: "#1668F0", title: t("lsb.tasks"), sub: tasks ? (open.length ? t("shm.home2.tasksTodo", { n: open.length }) : t("shm.home2.tasksNone")) : "—", to: "/pro/tasks", badge: open.length || undefined }
    : c.actions.acceptOrders
      ? { key: "market", icon: Target, tint: "#1668F0", title: t("lsb.marketplace"), sub: jobs ? n(jobs.length, "shm.ws.fresh") : "—", to: "/pro/market", badge: jobs?.length || undefined }
      : { key: "clients", icon: Users, tint: "#1668F0", title: t("shm.dash.statClients"), sub: n(c.clients, "shm.ws.clientsN"), to: "/(tabs)/clients" };
  const cards: WorkCard[] = [
    { key: "urgent", icon: Zap, tint: "#F97316", title: t("lsb.urgentAssigned"), sub: n(counts.urgent, "shm.ws.waiting"), to: "/pro/urgent", badge: counts.urgent || undefined },
    second,
  ];
  return (
    <View style={{ flex: 1 }}>
      <NavyBar title={t("tabs.workspace")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: pad }}>
        <HeaderExtra />
        <View style={body}>
          <AssignedAlert orders={c.orders} urgent={urgent} />
          <HeroCard name={name} avatar={account.data?.avatarUrl} kicker={`${role} · ${plan}`} stats={stats} />
          <View style={s.gap}><QuickTiles /></View>
          <WorkCards items={cards} />
          <View style={s.gap}><TodayList events={events} due={groups.today} /></View>
          <View style={s.gap}><StandingRing /></View>
          <View style={s.gap}><Chances /></View>
          <View style={s.gap}><AiCard i={0} advocate={advocate} /></View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = { gap: { marginTop: 8 } } as const;
