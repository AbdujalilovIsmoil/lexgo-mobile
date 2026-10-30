import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { displayName, useSession } from "@/entities/session";
import { useUnreadCount } from "@/entities/notification";
import { SupportMenu } from "@/features/support-menu";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { Avatar, IconButton, PressableScale } from "@/shared/ui";

// Global header actions of every tab page: notifications (with the unread dot) and
// the avatar that opens Profil (the AI centre button takes the 5th tab slot).
// A visitor has no profile yet: the person button opens the sign-in, like the bell. It is a button of its own — wrapped
// in another pressable it took the tap itself and nothing happened.
export function HeaderActions({ glass }: { glass?: boolean }) {
  const router = useRouter();
  const session = useSession();
  const unread = useUnreadCount();
  const role = useTabRole();
  const name = displayName(session?.user) || session?.user.phone;
  return (
    <View style={s.row}>
      {role === "client" || role === "seller" ? <SupportMenu glass={glass} client={role === "client"} /> : null}
      <IconButton icon="bell" size={40} tone={glass ? "glass" : "tint"} badge={unread > 0} onPress={() => router.push(session ? "/notifications" : "/auth/login")} />
      {session && name ? (
        <PressableScale onPress={() => router.push("/profile")} accessibilityLabel="profile">
          <Avatar name={name} size={40} />
        </PressableScale>
      ) : (
        <IconButton icon="user" size={40} tone={glass ? "glass" : "tint"} onPress={() => router.push(session ? "/profile" : "/auth/login")} />
      )}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 } });
