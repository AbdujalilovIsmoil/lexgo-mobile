import { Fragment, useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Application from "expo-application";
import { useUnreadCount } from "@/entities/notification";
import { displayName, useSession } from "@/entities/session";
import { useFeature, useMyFeatures, usePlans } from "@/entities/plan";
import { useReferral } from "@/entities/profile-extras";
import { useLogout } from "@/features/auth";
import { useBadge } from "@/shared/lib";
import { useInsets } from "@/shared/lib/insets";
import { formatAnyPhone } from "@/shared/lib/phone";
import { Avatar, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { LOCALES, LOCALE_LABELS, useLocaleStore, useT } from "@/shared/i18n";
import { useSidebar } from "./sidebarStore";
import { NAV, EXTRA, type NavItem } from "./navItems";

const INK = "#F1F5FC";
const MUTED = "#AEB9CF";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.07)";
const AVATAR = ["#F7A066", "#E8662E"] as const;

// Which card each of the client's rows sits in (anything not listed is a "main" row).
const ACCOUNT_KEYS = new Set(["subscription", "payments", "gifts", "referrals", "reviews", "warranty", "complaints", "entitlements", "consents"]);
const HELP_KEYS = new Set(["support"]);

type Row = { key: string; icon: IconName; label: string; value?: string; badge?: number; tone?: string; onPress: () => void };

// The client's drawer (and the visitor's): the brand row with the close button, the profile card, the plan card (free / current plan, the AI
// questions left, the way to Pro — the whole card opens the plans), the rows in cards under Asosiy / Hisob / Yordam / Ilova (language, privacy, settings), sign out and the
// app version — always on the deep navy of the design, whatever the theme.
export function MenuPanel({ onGo }: { onGo: (route: string) => void }) {
  const { t } = useT();
  const insets = useInsets();
  const user = useSession()?.user;
  const hide = useSidebar((s) => s.hide);
  const { confirm } = useLogout();
  const { locale, setLocale } = useLocaleStore();
  const [langs, setLangs] = useState(false);
  const features = useMyFeatures().data;
  const plans = usePlans().data;
  const ai = useFeature("ai_requests");
  const referral = useReferral().data;
  const badges = { notifications: useUnreadCount(), support: useBadge("support") };
  const paid = !!features?.active;
  const planName = paid ? plans?.find((p) => p.id === features?.planId)?.name ?? t("cdash.side.myPlan") : t("cdash.side.pro");
  const aiLine = !ai ? "" : ai.mode === "unlimited" ? t("cdash.side.aiUnlimited") : ai.remaining != null ? t("cdash.side.aiLeft", { n: ai.remaining }) : "";
  const goal = referral ? referral.eligibleAfter || 5 : 0;
  const valueOf = (key: string) =>
    key === "subscription" ? (paid ? planName : t("cdash.side.free")) : key === "referrals" && referral ? `${Math.min(referral.joined, goal)}/${goal}` : undefined;
  const toRow = (it: NavItem, label: string): Row => ({ key: it.key, icon: it.icon, label, value: valueOf(it.key), badge: it.badge ? badges[it.badge] : undefined, onPress: () => onGo(it.route) });
  const rows = [...NAV.map((it) => toRow(it, t(it.label ?? `cpd.menu.${it.key}`))), ...(user ? EXTRA.map((it) => toRow(it, t(`nav1.menu.${it.key}`))) : [])];
  const main = rows.filter((r) => !ACCOUNT_KEYS.has(r.key) && !HELP_KEYS.has(r.key));
  const account = rows.filter((r) => ACCOUNT_KEYS.has(r.key));
  const help = rows.filter((r) => HELP_KEYS.has(r.key));
  const app: Row[] = [
    { key: "lang", icon: "globe", label: t("cdash.side.lang"), value: LOCALE_LABELS[locale], onPress: () => setLangs((v) => !v) },
    { key: "privacy", icon: "shield", label: t("cdash.side.privacy"), onPress: () => onGo("/security") },
    { key: "settings", icon: "sun", label: t("cdash.side.settings"), onPress: () => onGo("/profile") },
  ];
  const name = user ? displayName(user) || user.phone : "";
  return (
    <View style={s.fill}>
      <LinearGradient colors={["#12265A", "#0D1A3E", "#0A1430"]} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.list, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 16 }]}>
        <View style={s.brand}>
          <LinearGradient colors={["#2A4C9C", "#13275E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logo}><Text variant="h4" style={s.logoTx}>L</Text></LinearGradient>
          <Text variant="h3" style={[s.flex, { color: INK }]}>LexGo</Text>
          <PressableScale onPress={hide} hitSlop={10} style={s.x} accessibilityRole="button" accessibilityLabel={t("cdash.side.close")}><Icon name="x" size={24} color={INK} /></PressableScale>
        </View>

        {user ? (
          <PressableScale onPress={() => onGo("/profile")} scale={0.98} accessibilityRole="button" style={[s.card, s.profile]}>
            <Avatar name={name} size={56} colors={AVATAR} />
            <View style={s.flex}>
              <Text variant="h4" numberOfLines={1} style={{ color: INK, fontSize: 18 }}>{name}</Text>
              {user.phone ? <Text variant="small" numberOfLines={1} style={{ color: MUTED }}>{formatAnyPhone(user.phone)}</Text> : null}
            </View>
            <Icon name="chevron-right" size={20} color={MUTED} />
          </PressableScale>
        ) : (
          <PressableScale onPress={() => onGo("/auth/login")} scale={0.98} accessibilityRole="button" style={[s.card, s.profile]}>
            <View style={s.guestIco}><Icon name="log-in" size={22} color={INK} /></View>
            <View style={s.flex}>
              <Text variant="h4" style={{ color: INK }}>{t("cdash.side.guestTitle")}</Text>
              <Text variant="small" style={{ color: MUTED }}>{t("cdash.side.guestSub")}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={MUTED} />
          </PressableScale>
        )}

        {user ? (
          <PressableScale onPress={() => onGo("/subscription")} scale={0.98} accessibilityRole="button" accessibilityLabel={`${planName} · ${paid ? t("cdash.side.seePlan") : t("cdash.side.toPro")}`}>
            <LinearGradient colors={["#1E3A86", "#1A2E66", "#172654"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.plan}>
              <View style={s.planTop}>
                <Text variant="caption" weight="bold" style={s.kick}>{(paid ? t("cdash.side.myPlan") : t("cdash.side.freePlan")).toUpperCase()}</Text>
                {aiLine ? <Text variant="small" weight="semibold" style={{ color: "#D6DEEE" }}>{aiLine}</Text> : null}
              </View>
              <Text variant="h3" style={{ color: "#FFFFFF" }}>{planName}</Text>
              <View style={s.planBtn}>
                <Text variant="body" weight="bold" style={{ color: "#0B1636" }}>{paid ? t("cdash.side.seePlan") : t("cdash.side.toPro")}</Text>
              </View>
            </LinearGradient>
          </PressableScale>
        ) : null}

        <Section title={t("cdash.side.main")} rows={main} />
        {account.length ? <Section title={t("cdash.side.account")} rows={account} /> : null}
        <Section title={t("cdash.side.help")} rows={help} />
        <Section title={t("cdash.side.app")} rows={app} after={(key) => (key === "lang" && langs ? (
          <View style={s.langs}>
            {LOCALES.map((l) => (
              <PressableScale key={l} onPress={() => { setLocale(l); setLangs(false); }} accessibilityRole="button" accessibilityState={{ selected: l === locale }} style={[s.lang, l === locale && s.langOn]}>
                <Text variant="small" weight="semibold" style={{ color: l === locale ? "#0B1636" : INK }}>{LOCALE_LABELS[l]}</Text>
              </PressableScale>
            ))}
          </View>
        ) : null)} />

        <PressableScale onPress={user ? confirm : () => onGo("/auth/login")} scale={0.98} accessibilityRole="button" style={[s.card, s.out]}>
          <Icon name={user ? "log-out" : "log-in"} size={21} color={INK} />
          <Text variant="body" weight="semibold" style={{ color: INK }}>{t(user ? "profile.logout" : "guest.login")}</Text>
        </PressableScale>
        <Text variant="small" style={s.version}>{t("cdash.side.version", { v: Application.nativeApplicationVersion ?? "" })}</Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, rows, after }: { title: string; rows: Row[]; after?: (key: string) => ReactNode }) {
  if (!rows.length) return null;
  return (
    <View style={s.section}>
      <Text variant="caption" weight="bold" style={s.head}>{title.toUpperCase()}</Text>
      <View style={s.card}>
        {rows.map((r, i) => (
          <Fragment key={r.key}>
            <PressableScale onPress={r.onPress} scale={0.99} accessibilityRole="menuitem" style={s.row}>
              <Icon name={r.icon} size={21} color={r.tone ?? "#D6DEEE"} />
              <Text variant="body" weight="medium" numberOfLines={1} style={[s.flex, { color: r.tone ?? INK }]}>{r.label}</Text>
              {r.badge ? <View style={s.badge}><Text variant="caption" weight="bold" tone="white">{r.badge > 99 ? "99+" : r.badge}</Text></View> : null}
              {r.value ? <Text variant="body" numberOfLines={1} style={s.value}>{r.value}</Text> : null}
              <Icon name="chevron-right" size={18} color={MUTED} />
            </PressableScale>
            {after?.(r.key)}
            {i < rows.length - 1 ? <View style={s.rule} /> : null}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  list: { paddingHorizontal: 16, gap: 14 },
  brand: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 2, paddingBottom: 4 },
  logo: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  logoTx: { color: "#FFFFFF", fontSize: 19 },
  x: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 20, borderWidth: 1, borderColor: LINE, backgroundColor: CARD, overflow: "hidden" },
  profile: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  guestIco: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  plan: { borderRadius: 20, padding: 18, gap: 10 },
  planTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  kick: { color: "#B9C6E4", letterSpacing: 0.6 },
  planBtn: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 11, marginTop: 4 },
  section: { gap: 10 },
  head: { color: "#B9C6E4", letterSpacing: 0.8, marginLeft: 4, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 15 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.14)", marginLeft: 53 },
  value: { color: MUTED, maxWidth: 120 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: "#E5484D", alignItems: "center", justifyContent: "center" },
  langs: { flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingBottom: 14 },
  lang: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: LINE },
  langOn: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  out: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 17, marginTop: 4, backgroundColor: "transparent" },
  version: { color: MUTED, marginLeft: 4 },
});
