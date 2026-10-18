import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { groupTasks, n, useCabinet } from "@/entities/pro-workspace";
import { useSession } from "@/entities/session";
import { useResync } from "@/shared/realtime";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { useInsets } from "@/shared/lib/insets";
import { todayKey } from "@/shared/lib/pro/dates";
import { InfoCards, StatusBanner } from "@/widgets/pro-dashboard";
import { useT } from "@/shared/i18n";
import { AiCard } from "./AiCard";
import { BoostCard } from "./BoostCard";
import { HomeQuick } from "./HomeQuick";
import { MetricsPanel } from "./MetricsPanel";
import { NewAlert } from "./NewAlert";
import { NewCases } from "./NewCases";
import { PayoutsPanel } from "./PayoutsPanel";
import { ReferralProgress } from "./ReferralProgress";
import { SecurityFold } from "./SecurityFold";
import { SellerHero, type HeroStat } from "./SellerHero";
import { TasksPanel } from "./TasksPanel";

const KEYS = ["pro-workspace", "pro-requests", "pro-calendar", "pro-tasks", "pro-cases", "pro-clients", "pro-referral", "pay-referral"];

// The professional's home, built like the client's: one dark hero holding the header row, the greeting and the three counters;
// then quick actions → my tasks → referral ladder → LexGo AI → new cases → metrics → payouts → account security (advocate:
// the promotion card in its place). Everything comes from the backend (the cabinet, payouts, referral). A pending seller sees
// only the verification state. Profile completeness lives on the profile page.
export function SellerHome({ bottomPad, orgEntry }: { bottomPad: number; orgEntry?: ReactNode }) {
  const { t } = useT();
  const qc = useQueryClient();
  const insets = useInsets();
  const session = useSession();
  const advocate = session?.user.role === "advocate";
  const cabinet = useCabinet();
  const refresh = () => KEYS.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
  useResync(refresh);
  const c = cabinet.data;
  const name = (session?.user.firstName || session?.user.name || "").split(" ")[0];
  const pad = Math.max(bottomPad, insets.bottom + 24);
  const body = { padding: 16, gap: 14 } as const;
  const refreshing = <RefreshControl refreshing={cabinet.isRefetching} onRefresh={refresh} />;
  if (!c || c.limited) {
    return (
      <ScrollView contentContainerStyle={{ ...body, paddingBottom: pad }} refreshControl={refreshing} showsVerticalScrollIndicator={false}>
        <StatusBanner />
        <InfoCards orgEntry={orgEntry} />
      </ScrollView>
    );
  }
  const meetings = n(c.workload, "courts_today");
  const today = groupTasks(c.cases, todayKey()).today.length;
  const stats: HeroStat[] = [
    { key: "clients", icon: "users", tint: "#1668F0", value: String(c.clients), label: t("shm.dash.statClients"), to: "/(tabs)/clients" },
    { key: "cases", icon: "briefcase", tint: "#7A5CFF", value: String(c.cases.length), label: t("shm.dash.statCases"), to: "/pro/cases" },
    { key: "meetings", icon: "calendar", tint: "#00A870", value: String(meetings), label: t("shm.dash.statMeetingsShort"), to: "/pro/calendar" },
    { key: "docs", icon: "file-text", tint: "#E0457F", value: String(n(c.workload, "documents_to_review")), label: t("shm.dash.statDocs"), to: "/pro/files" },
  ];
  let k = 0;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: pad }} refreshControl={refreshing} showsVerticalScrollIndicator={false}>
      <SellerHero name={name} stats={stats} meetings={meetings} tasks={today} />
      <View style={{ height: 16 }} />
      <HeaderExtra />
      <View style={body}>
        <NewAlert n={c.orders.length} />
        <HomeQuick />
        <View style={{ marginBottom: 6 }}><TasksPanel cases={c.cases} i={k++} /></View>
        <ReferralProgress i={k++} />
        <AiCard i={k++} />
        <NewCases orders={c.orders} i={k++} />
        <MetricsPanel cabinet={c} i={k++} />
        <PayoutsPanel i={k++} />
        {advocate ? <BoostCard i={k++} /> : <SecurityFold i={k++} />}
        {orgEntry}
      </View>
    </ScrollView>
  );
}
