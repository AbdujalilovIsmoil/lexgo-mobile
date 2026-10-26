import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { usePathname } from "expo-router";
import { useUnreadCount } from "@/entities/notification";
import { displayName, useSession } from "@/entities/session";
import { useLogout } from "@/features/auth";
import { useBadge } from "@/shared/lib";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, BrandLogo } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { EXTRA, TEAM_TASKS, isActive, navFor } from "./navItems";
import { SidebarItem } from "./SidebarItem";
import { useAccess } from "@/entities/access";
import { useCabinet } from "@/entities/pro-workspace";

// The drawer content: brand + role, the web sidebar rows in the web order, the mobile-only account rows, and sign out.
export function SidebarPanel({ p, onGo, reveal }: { p: SharedValue<number>; onGo: (route: string) => void; reveal?: SharedValue<number> }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const path = usePathname();
  const user = useSession()?.user;
  const { confirm } = useLogout();
  const role = useTabRole();
  const access = useAccess();
  // Only fetched for professionals: "under review" and the allowed actions shape their rows. Until the cabinet is there a
  // pending account already counts as under review (the web does the same), so no locked row flashes in.
  const cabinet = useCabinet().data;
  const limited = cabinet ? cabinet.limited : user?.accountStatus === "pending";
  const base = navFor(role, { kind: user?.role, limited, actions: cabinet?.actions });
  const nav = access.can("tasks.view") && role !== "guest" ? [TEAM_TASKS, ...base] : base;
  const client = role === "client" || role === "guest";
  // A tablet's rail: the sign-out button is a round 46 pt button at rest and stretches to the full row as the panel opens; its icon stays put.
  const fade = useAnimatedStyle(() => ({ opacity: reveal ? reveal.value : 1 }));
  const footBox = useAnimatedStyle(() => (reveal ? { width: interpolate(reveal.value, [0, 1], [46, 260]), marginLeft: interpolate(reveal.value, [0, 1], [15, 14]) } : {}));
  const footRow = useAnimatedStyle(() => (reveal ? { paddingLeft: interpolate(reveal.value, [0, 1], [14, 88]) } : { justifyContent: "center" as const, flex: 1 }));
  const badges = { notifications: useUnreadCount(), support: useBadge("support") };
  return (
    <View style={[s.fill, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 }]}>
      <View style={[s.brand, reveal && s.brandDock]}>
        <BrandLogo size={40} />
        <Animated.View style={[s.fill, fade]}>
          <Text variant="h4">LexGo</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{user ? `${displayName(user) || t("ntd.sbTitle")} · ${t(user.role === "advocate" ? "profile.roleAdvocate" : user.role === "lawyer" ? "profile.roleLawyer" : "profile.roleClient")}` : t("home.guest")}</Text>
        </Animated.View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {nav.map((it, i) => <SidebarItem key={it.key} p={p} index={i} item={it} label={t(it.label ?? `cpd.menu.${it.key}`)} active={isActive(it.route, path)} badge={it.badge ? badges[it.badge] : undefined} reveal={reveal} onPress={() => onGo(it.route)} />)}
        {client ? <Animated.View style={fade}><Text variant="kicker" tone="gray2" style={s.kick}>{t("ntd.sbMore").toUpperCase()}</Text></Animated.View> : null}
        {(client ? EXTRA : []).map((it, i) => <SidebarItem key={it.key} p={p} index={nav.length + i} item={it} label={t(`nav1.menu.${it.key}`)} active={isActive(it.route, path)} reveal={reveal} onPress={() => onGo(it.route)} />)}
      </ScrollView>
      <Animated.View style={[s.foot, footBox]}>
        <PressableScale onPress={user ? confirm : () => onGo("/auth/login")} style={[s.out, user ? { borderColor: c.line } : { borderColor: c.accent, backgroundColor: c.tint }]} accessibilityRole="button" accessibilityLabel={t(user ? "profile.logout" : "guest.login")}>
          <Animated.View style={[s.outRow, footRow]}>
            <Icon name={user ? "log-out" : "log-in"} size={17} tone={user ? "gray" : "accent"} />
            <Animated.View style={fade}><Text variant="small" weight={user ? "semibold" : "bold"} tone={user ? "gray" : "accent"} numberOfLines={1}>{t(user ? "profile.logout" : "guest.login")}</Text></Animated.View>
          </Animated.View>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  list: { paddingHorizontal: 10, gap: 2, paddingBottom: 8 },
  brandDock: { paddingHorizontal: 18 }, // the logo's centre sits at the rail's centre
  foot: { marginHorizontal: 14 },
  outRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  kick: { marginTop: 12, marginLeft: 8, marginBottom: 4 },
  out: { minHeight: 46, borderRadius: 23, borderWidth: 1, justifyContent: "center", overflow: "hidden" },
});
