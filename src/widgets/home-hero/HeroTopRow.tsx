import { Image, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, IconButton, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useUnreadCount } from "@/entities/notification";
import { HeaderRight } from "@/shared/ui/headerExtra";
import { DemoPill } from "@/shared/demo/DemoPill";

// Logo + greeting on the left, bell + avatar on the right.
export function HeroTopRow({ name }: { name?: string }) {
  const { t } = useT();
  const router = useRouter();
  const unread = useUnreadCount();
  return (
    <View style={s.row}>
      <View style={s.brand}>
        <Image source={require("../../../assets/logo.png")} style={s.logo} />
        <View>
          <Text variant="caption" style={s.hi}>
            {t("home.greeting")}
          </Text>
          <Text variant="h4" tone="white" numberOfLines={1}>
            {name || t("home.guest")}
          </Text>
        </View>
      </View>
      <View style={s.actions}>
        <DemoPill glass />
        {name ? <HeaderRight glass /> : null}
        <IconButton icon="bell" size={40} tone="glass" badge={unread > 0} onPress={() => router.push(name ? "/notifications" : "/auth/login")} />
        {name ? (
          <PressableScale onPress={() => router.push("/(tabs)/profile")}>
            <Avatar name={name} size={40} />
          </PressableScale>
        ) : (
          <IconButton icon="user" size={40} tone="glass" onPress={() => router.push("/(tabs)/profile")} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logo: { width: 40, height: 40, borderRadius: 12 },
  hi: { color: "#93C6FF" },
  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
});
