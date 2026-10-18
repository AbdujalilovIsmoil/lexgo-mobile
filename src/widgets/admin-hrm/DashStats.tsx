import { View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { daysOverdue, isOpenTask, stLabel, useDashTasks, useDashUnread, useToday } from "@/entities/admin-hrm";
import { useT } from "@/shared/i18n";
import { StatTile } from "./StatTile";

// Four live counters of the signed-in employee as coloured tiles; each opens the matching screen.
export function DashStats() {
  const { t } = useT();
  const router = useRouter();
  const today = useToday();
  const tasks = (useDashTasks().data ?? []).filter(isOpenTask);
  const unread = useDashUnread().data?.length ?? 0;
  const late = tasks.filter((x) => daysOverdue(x)).length;
  const go = (key: string) => () => router.push(`/manage/internal/${key}` as never);
  const att = today.data?.attendance;
  const pend = today.data?.pendingApprovals ?? 0;
  const tiles = [
    <StatTile key="t" icon="check-square" tint="#F59E0B" label={t("admHrm.openTasks")} value={String(tasks.length)} hint={late ? t("admHrmS.overdue", { n: late }) : undefined} onPress={go("tasks")} />,
    <StatTile key="a" icon="calendar" tint="#22C55E" label={t("admHrm.todayStatus")} value={att ? stLabel(t, att.status) : t("admHrm.notStarted")} onPress={go("attendance")} />,
    <StatTile key="m" icon="message-circle" tint="#EC4899" label={t("admHrm.unreadMsgs")} value={String(unread)} onPress={go("messages")} />,
    <StatTile key="p" icon="shield" tint="#6366F1" label={t("admHrm.pendingAppr")} value={String(pend)} onPress={go("approvals")} />,
  ];
  return (
    <View style={{ gap: 10 }}>
      {[0, 2].map((i) => <Animated.View key={i} entering={FadeInUp.delay(i * 40).duration(220)} style={{ flexDirection: "row", gap: 10 }}>{tiles.slice(i, i + 2)}</Animated.View>)}
    </View>
  );
}
