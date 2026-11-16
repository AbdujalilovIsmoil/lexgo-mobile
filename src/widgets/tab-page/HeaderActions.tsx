import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, MessageCircle, User } from "lucide-react-native";
import { displayName, useSession } from "@/entities/session";
import { useUnreadCount } from "@/entities/notification";
import { SupportMenu } from "@/features/support-menu";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { Avatar, IconButton, PressableScale } from "@/shared/ui";
import { useBadge } from "@/shared/lib/badgeStore";
import { useT } from "@/shared/i18n";

// Global header actions of every tab page: support, notifications (with the unread dot), then — for a client or a visitor — the chats
// (Xabarlar, with the unread dot: their bar's last slot is Profil), or for a professional the avatar that opens Profil.
// A visitor has no profile yet: the person button opens the sign-in, like the bell. It is a button of its own — wrapped
// in another pressable it took the tap itself and nothing happened.
export function HeaderActions({ glass }: { glass?: boolean }) {
  const router = useRouter();
  const session = useSession();
  const unread = useUnreadCount();
  const role = useTabRole();
  const name = displayName(session?.user) || session?.user.phone;
  const unreadChats = useBadge("messages");
  const { t } = useT();
  const chats = role === "client" || role === "guest";
  return (
    <View style={s.row}>
      {role === "client" || role === "seller" ? <SupportMenu glass={glass} client={role === "client"} /> : null}
      <IconButton icon="bell" size={40} tone={glass ? "glass" : "tint"} badge={unread > 0} glyph={(color, size) => <Bell size={size} color={color} />} onPress={() => router.push(session ? "/notifications" : "/auth/login")} />
      {chats ? (
        <IconButton icon="message-circle" size={40} tone={glass ? "glass" : "tint"} badge={unreadChats > 0} label={t("tabs.messages")} glyph={(color, size) => <MessageCircle size={size} color={color} />} onPress={() => router.push(session ? "/m/messages" : "/auth/login")} />
      ) : session && name ? (
        <PressableScale onPress={() => router.push("/profile")} accessibilityLabel="profile">
          <Avatar name={name} size={40} />
        </PressableScale>
      ) : (
        <IconButton icon="user" size={40} tone={glass ? "glass" : "tint"} glyph={(color, size) => <User size={size} color={color} />} onPress={() => router.push(session ? "/profile" : "/auth/login")} />
      )}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 } });
