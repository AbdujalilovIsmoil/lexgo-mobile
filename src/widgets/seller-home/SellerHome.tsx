import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { groupTasks, n, useCabinet } from "@/entities/pro-workspace";
import { displayName, useSession } from "@/entities/session";
import { useResync } from "@/shared/realtime";
import { ErrorView, HeroScroll, Skeleton } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { useInsets } from "@/shared/lib/insets";
import { todayKey } from "@/shared/lib/pro/dates";
import { InfoCards, StatusBanner } from "@/widgets/pro-dashboard";
import { useT } from "@/shared/i18n";
import { ActivityPanel } from "./ActivityPanel";
import { AiCard } from "./AiCard";
import { BoostCard } from "./BoostCard";
import { HomeQuick } from "./HomeQuick";
import { MetricsPanel } from "./MetricsPanel";
import { NewAlert } from "./NewAlert";
import { NewCases } from "./NewCases";
import { PayoutsPanel } from "./PayoutsPanel";
import { ProfileStrengthCard } from "./ProfileStrengthCard";
import { RatingPanel } from "./RatingPanel";
import { ReferralProgress } from "./ReferralProgress";
import { SecurityFold } from "./SecurityFold";
import { SellerHero, type HeroStat } from "./SellerHero";
import { TasksPanel } from "./TasksPanel";
import { UpcomingPanel } from "./UpcomingPanel";

const KEYS = ["pro-workspace", "pro-profile", "seller-rating", "pro-requests", "pro-calendar", "pro-tasks", "pro-cases", "pro-clients", "pro-referral", "pay-referral"];

// The professional's home, built like the client's: one dark hero holding the header row, the greeting and the three counters;
// then the profile's completeness ring → quick actions → my tasks → the next calendar items → recent activity → referral ladder → LexGo AI
// → new cases → metrics → the rating breakdown → payouts → account security (advocate: the promotion card in its place). Everything comes from the backend (the cabinet, payouts, referral). A pending
// seller sees the verification state and the completeness ring.
export function SellerHome({ bottomPad }: { bottomPad: number }) {
  const { t } = useT();
  const qc = useQueryClient();
  const insets = useInsets();
  const session = useSession();
  const advocate = session?.user.role === "advocate";
  const cabinet = useCabinet();
  const refresh = () => KEYS.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
  useResync(refresh);
  const c = cabinet.data;
  const name = displayName(session?.user);
  const pad = Math.max(bottomPad, insets.bottom + 24);
  const body = { padding: 16, gap: 14 } as const;
  const meetings = c ? n(c.workload, "courts_today") : 0;
  const today = c ? groupTasks(c.cases, todayKey()).today.length : 0;
  const dash = (v: number | undefined) => (c ? String(v ?? 0) : "—");
  const stats: HeroStat[] = [
    { key: "clients", icon: "users", tint: "#1668F0", value: dash(c?.clients), label: t("shm.dash.statClients"), to: "/(tabs)/clients" },
    { key: "cases", icon: "briefcase", tint: "#7A5CFF", value: dash(c?.cases.length), label: t("shm.dash.statCases"), to: "/pro/cases" },
    { key: "meetings", icon: "calendar", tint: "#00A870", value: dash(meetings), label: t("shm.dash.statMeetingsShort"), to: "/pro/calendar" },
    { key: "docs", icon: "file-text", tint: "#E0457F", value: dash(c ? n(c.workload, "documents_to_review") : 0), label: t("shm.dash.statDocs"), to: "/pro/files" },
  ];
  // The cabinet is not here yet (the first start, or a new build whose saved copy no longer counts) or could not be read: the same page
  // with its counters still empty and the panels as placeholders — never the pending seller's layout, which an approved professional
  // used to see for a moment before the real home replaced it.
  if (!c) {
    return (
      <HeroScroll contentContainerStyle={{ paddingBottom: pad }}>
        <SellerHero name={name} stats={stats} meetings={0} tasks={0} advocate={advocate} loading />
        <View style={{ height: 16 }} />
        <View style={body}>
          {cabinet.isError ? <ErrorView error={cabinet.error} onRetry={() => void cabinet.refetch()} compact /> : [0, 1, 2].map((i) => <Skeleton key={i} height={i ? 120 : 150} round={22} />)}
        </View>
      </HeroScroll>
    );
  }
  // A seller still being verified: the header row (menu, notifications, profile) stays, then where verification stands.
  if (c.limited) {
    return (
      <HeroScroll contentContainerStyle={{ paddingBottom: pad }}>
        <SellerHero name={name} stats={[]} meetings={0} tasks={0} advocate={advocate} brief />
        <View style={body}>
          <StatusBanner />
          <ProfileStrengthCard i={0} />
          <InfoCards />
        </View>
      </HeroScroll>
    );
  }
  let k = 0;
  return (
    <HeroScroll contentContainerStyle={{ paddingBottom: pad }}>
      <SellerHero name={name} stats={stats} meetings={meetings} tasks={today} advocate={advocate} license={c.license} />
      <View style={{ height: 16 }} />
      <HeaderExtra />
      <View style={body}>
        <NewAlert n={c.orders.length} />
        <ProfileStrengthCard i={k++} />
        <HomeQuick />
        <View style={{ marginBottom: 6 }}><TasksPanel cases={c.cases} i={k++} /></View>
        <UpcomingPanel i={k++} />
        <ActivityPanel notes={c.notes} i={k++} />
        <ReferralProgress i={k++} />
        <AiCard i={k++} advocate={advocate} />
        <NewCases orders={c.orders} i={k++} />
        <MetricsPanel cabinet={c} i={k++} />
        <RatingPanel i={k++} />
        <PayoutsPanel i={k++} />
        {advocate ? <BoostCard i={k++} /> : <SecurityFold i={k++} />}
      </View>
    </HeroScroll>
  );
}
