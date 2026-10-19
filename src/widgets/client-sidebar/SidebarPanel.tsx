import { Image, ScrollView, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { usePathname } from "expo-router";
import { useUnreadCount } from "@/entities/notification";
import { displayName, useSession } from "@/entities/session";
import { useLogout } from "@/features/auth";
import { useBadge } from "@/shared/lib";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { EXTRA, isActive, navFor } from "./navItems";
import { SidebarItem } from "./SidebarItem";
import { useAccess } from "@/entities/access";

// The drawer content: brand + role, the web sidebar rows in the web order, the mobile-only account rows, and sign out.
export function SidebarPanel({ p, onGo }: { p: SharedValue<number>; onGo: (route: string) => void }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const path = usePathname();
  const user = useSession()?.user;
  const { confirm } = useLogout();
  const role = useTabRole();
  const access = useAccess();
  const nav = navFor(role, { kind: user?.role, orgOwner: access.orgOwner });
  const client = role === "client" || role === "guest";
  const badges = { notifications: useUnreadCount(), support: useBadge("support") };
  return (
    <View style={[s.fill, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 }]}>
      <View style={s.brand}>
        <Image source={require("../../../assets/logo-small.png")} style={s.logo} />
        <View style={s.fill}>
          <Text variant="h4">LexGo</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{user ? `${displayName(user) || t("ntd.sbTitle")} ·${t(role === "client" ? "profile.roleClient" : user.role === "advocate" ? "profile.roleAdvocate" : user.role === "lawyer" ? "profile.roleLawyer" : "tabs.admin")}` : t("home.guest")}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {nav.map((it, i) => <SidebarItem key={it.key} p={p} index={i} item={it} label={t(it.label ?? `cpd.menu.${it.key}`)} active={isActive(it.route, path)} badge={it.badge ? badges[it.badge] : undefined} onPress={() => onGo(it.route)} />)}
        {client ? <Text variant="kicker" tone="gray2" style={s.kick}>{t("ntd.sbMore").toUpperCase()}</Text> : null}
        {(client ? EXTRA : []).map((it, i) => <SidebarItem key={it.key} p={p} index={nav.length + i} item={it} label={t(`nav1.menu.${it.key}`)} active={isActive(it.route, path)} onPress={() => onGo(it.route)} />)}
      </ScrollView>
      {user ? (
        <PressableScale onPress={confirm} style={[s.out, { borderColor: c.line }]} accessibilityRole="button">
          <Icon name="log-out" size={17} tone="gray" /><Text variant="small" weight="semibold" tone="gray">{t("profile.logout")}</Text>
        </PressableScale>
      ) : (
        <PressableScale onPress={() => onGo("/auth/login")} style={[s.out, { borderColor: c.accent, backgroundColor: c.tint }]} accessibilityRole="button">
          <Icon name="log-in" size={17} tone="accent" /><Text variant="small" weight="bold" tone="accent">{t("guest.login")}</Text>
        </PressableScale>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  logo: { width: 40, height: 40, borderRadius: 12 },
  list: { paddingHorizontal: 10, gap: 2, paddingBottom: 8 },
  kick: { marginTop: 12, marginLeft: 8, marginBottom: 4 },
  out: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 14, minHeight: 46, borderRadius: 23, borderWidth: 1 },
});
