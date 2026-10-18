import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { MessageRow, TaskRow, isOpenTask, useDashTasks, useDashUnread, useNames } from "@/entities/admin-hrm";
import { useSession } from "@/entities/session";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

function Head({ title, onPress }: { title: string; onPress: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
      <Text variant="h4">{title}</Text>
      <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button"><Text variant="small" weight="semibold" style={{ color: c.accent }}>{t("admHrm.seeAll")}</Text></Pressable>
    </View>
  );
}

// The five most relevant open tasks and unread messages as tickets, each list with a "see all" link.
export function DashLists() {
  const { t } = useT();
  const router = useRouter();
  const me = useSession()?.user.id ?? "";
  const names = useNames();
  const tasks = (useDashTasks().data ?? []).filter(isOpenTask).slice(0, 5);
  const msgs = (useDashUnread().data ?? []).slice(0, 5);
  const go = (key: string) => () => router.push(`/manage/internal/${key}` as never);
  return (
    <>
      <Head title={t("admHrm.nav.tasks")} onPress={go("tasks")} />
      {tasks.length ? tasks.map((x) => <TaskRow key={x.id} item={x} onPress={go("tasks")} />) : <Text variant="small" tone="gray">{t("admHrm.noTasks")}</Text>}
      <Head title={t("admHrm.unreadTitle")} onPress={go("messages")} />
      {msgs.length ? msgs.map((m) => <MessageRow key={m.id} item={m} me={me} who={names.user(m.senderId)} onPress={go("messages")} />) : <Text variant="small" tone="gray">{t("admHrm.noUnread")}</Text>}
    </>
  );
}
