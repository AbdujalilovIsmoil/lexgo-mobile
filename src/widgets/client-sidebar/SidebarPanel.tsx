import { ScrollView, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
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
import { useAccess, visibleModules, webSidebarOnly } from "@/entities/access";
import { useCabinet } from "@/entities/pro-workspace";

// The drawer content: brand + role, the web sidebar rows in the web order, the mobile-only account rows, and sign out.
export function SidebarPanel({ p, onGo, compact }: { p: SharedValue<number>; onGo: (route: string) => void; compact?: boolean }) {
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
  const modules = role === "sales" ? new Set(visibleModules(access).map((m) => m.key)) : undefined;
  const duty = role === "seller" && webSidebarOnly(access) ? visibleModules(access).map((m) => ({ key: m.key, icon: m.icon })) : undefined;
  const base = navFor(role, { kind: user?.role, orgOwner: access.orgOwner, callCenterLawyer: access.callCenterLawyer, limited, actions: cabinet?.actions, modules, duty });
  const nav = access.can("tasks.view") && role !== "guest" ? [TEAM_TASKS, ...base] : base;
  const client = role === "client" || role === "guest";
  const badges = { notifications: useUnreadCount(), support: useBadge("support") };
  return (
    <View style={[s.fill, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 }]}>
      <View style={[s.brand, compact && s.brandRail]}>
        <BrandLogo size={40} />
        {compact ? null : <View style={s.fill}>
          <Text variant="h4">LexGo</Text>
          <Text variant="caption" tone="gray" numberOfLines={1}>{user ? `${displayName(user) || t("ntd.sbTitle")} ·${t(role === "client" ? "profile.roleClient" : role === "sales" ? "salesOp.role" : user.role === "advocate" ? "profile.roleAdvocate" : user.role === "lawyer" ? "profile.roleLawyer" : "tabs.admin")}` : t("home.guest")}</Text>
        </View>}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {nav.map((it, i) => <SidebarItem key={it.key} p={p} index={i} item={it} label={t(it.label ?? `cpd.menu.${it.key}`)} active={isActive(it.route, path)} badge={it.badge ? badges[it.badge] : undefined} compact={compact} onPress={() => onGo(it.route)} />)}
        {client && !compact ? <Text variant="kicker" tone="gray2" style={s.kick}>{t("ntd.sbMore").toUpperCase()}</Text> : null}
        {(client ? EXTRA : []).map((it, i) => <SidebarItem key={it.key} p={p} index={nav.length + i} item={it} label={t(`nav1.menu.${it.key}`)} active={isActive(it.route, path)} compact={compact} onPress={() => onGo(it.route)} />)}
      </ScrollView>
      {compact ? (
        <PressableScale onPress={user ? confirm : () => onGo("/auth/login")} style={[s.outRail, { borderColor: user ? c.line : c.accent }]} accessibilityRole="button" accessibilityLabel={t(user ? "profile.logout" : "guest.login")}>
          <Icon name={user ? "log-out" : "log-in"} size={18} tone={user ? "gray" : "accent"} />
        </PressableScale>
      ) : user ? (
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
  list: { paddingHorizontal: 10, gap: 2, paddingBottom: 8 },
  brandRail: { justifyContent: "center", paddingHorizontal: 0 },
  outRail: { alignSelf: "center", width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  kick: { marginTop: 12, marginLeft: 8, marginBottom: 4 },
  out: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 14, minHeight: 46, borderRadius: 23, borderWidth: 1 },
});
