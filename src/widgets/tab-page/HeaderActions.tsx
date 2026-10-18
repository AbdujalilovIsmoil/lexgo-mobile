import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/entities/session";
import { useUnreadCount } from "@/entities/notification";
import { SupportMenu } from "@/features/support-menu";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { Avatar, IconButton, PressableScale } from "@/shared/ui";
import { DemoPill } from "@/shared/demo/DemoPill";

// Global header actions of every tab page: notifications (with the unread dot) and
// the avatar that opens Profil (the AI centre button takes the 5th tab slot).
export function HeaderActions({ glass }: { glass?: boolean }) {
  const router = useRouter();
  const session = useSession();
  const unread = useUnreadCount();
  const role = useTabRole();
  const name = session?.user.name || session?.user.phone;
  return (
    <View style={s.row}>
      <DemoPill glass={glass} />
      {role === "client" || role === "seller" ? <SupportMenu glass={glass} client={role === "client"} /> : null}
      <IconButton icon="bell" size={40} tone={glass ? "glass" : "tint"} badge={unread > 0} onPress={() => router.push(session ? "/notifications" : "/auth/login")} />
      <PressableScale onPress={() => router.push("/(tabs)/profile")} accessibilityLabel="profile">
        {name ? <Avatar name={name} size={40} /> : <IconButton icon="user" size={40} tone={glass ? "glass" : "tint"} />}
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 } });
