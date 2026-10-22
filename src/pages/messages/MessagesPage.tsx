import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState, Icon, PressableScale } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useAccess } from "@/entities/access";
import { TabPage } from "@/widgets/tab-page";
import { RoomsList } from "@/widgets/secure-chat";
import { PushPermissionCard } from "@/widgets/push-permission";
import { NewChatSheet, useSellerActions } from "@/features/secure-chat";
import { myRooms, unreadTotal, useRooms } from "@/entities/secure-chat";
import { useMine } from "@/entities/urgent";
import { chatPath } from "@/entities/call";
import { useSession } from "@/entities/session";
import { useSocketState } from "@/shared/realtime";
import { useInsets } from "@/shared/lib/insets";
import { shadows } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Xabarlar" tab — the secure-chat inbox of every role: my conversations, newest first, unread counters
// (also on the tab badge, see MsgMounts), search, a filter sheet and "new chat" as a floating button (bottom right).
export function MessagesPage() {
  const { t } = useT();
  const router = useRouter();
  const myId = useSession()?.user.id ?? "";
  const insets = useInsets();
  // Top edge of the tab bar, from the screen's bottom. On iOS the system bar is part of the screen's safe area, so `insets.bottom` already
  // reaches its top; the Android bar floats over the page. The list ends a little above it, the new-chat button sits on it.
  const barTop = Platform.OS === "ios" ? insets.bottom : insets.bottom + 76;
  const pad = barTop + 16;
  const q = useRooms(useSocketState() === "online", myId);
  const staff = useAccess().staff;
  const locked = !useSellerActions().chat;
  const [creating, setCreating] = useState(false);
  const reqs = useMine().data ?? [];
  const tagOf = (r: { id: string }) => { const u = reqs.find((x) => x.roomId === r.id); return u ? [u.serviceTitle || u.serviceKind, u.workId].filter(Boolean).join(" · ") : ""; };
  const mine = myRooms(q.data ?? [], myId);
  const unread = unreadTotal(q.data ?? [], myId);
  if (!myId) return <TabPage title={t("tabs.messages")}><EmptyState icon="lock" title={t("ms1.signIn")} text={t("ms1.signInText")} actionLabel={t("guest.login")} onAction={() => router.push("/auth/login")} /></TabPage>;
  if (locked) return <TabPage title={t("tabs.messages")}><EmptyState icon="shield" title={t("ms1.locked")} text={t("ms1.lockedText")} /></TabPage>;
  return (
    <TabPage title={t("tabs.messages")} subtitle={unread ? t("ms1.unreadN", { n: unread }) : t("admChat.count", { n: mine.length })}>
      <RoomsList tagOf={tagOf} query={q} rooms={mine} myId={myId} bottom={pad} onOpen={(r) => router.push(chatPath(r.id) as never)} header={<>{staff ? <RowCard icon="eye" tint="#8B5CF6" title={t("ms1.monitor")} subtitle={t("ms1.monitorText")} onPress={() => router.push("/manage/chats" as never)} /> : null}<PushPermissionCard /></>} action={{ label: t("ms1.newChat"), onPress: () => setCreating(true) }} />
      <PressableScale onPress={() => setCreating(true)} accessibilityRole="button" accessibilityLabel={t("ms1.newChat")} style={[styles.fab, shadows.blue, { bottom: barTop + 12 }]}>
        <Icon name="edit-2" size={24} color="#FFFFFF" />
      </PressableScale>
      <NewChatSheet visible={creating} onClose={() => setCreating(false)} />
    </TabPage>
  );
}

const styles = StyleSheet.create({ fab: { position: "absolute", right: 18, width: 58, height: 58, borderRadius: 29, backgroundColor: "#1668F0", alignItems: "center", justifyContent: "center" } });
