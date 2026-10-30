import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { displayName, type User } from "@/entities/session";
import { needsAction, useClientProfile, useConsents, useReferral } from "@/entities/profile-extras";
import { useMyFeatures, usePlans } from "@/entities/plan";
import { isOpenWork, useWorks } from "@/entities/work";
import { Avatar, Icon, IconButton, PressableScale, Text, backIcon, type IconName } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { useColors } from "@/shared/theme";
import { useInsets, HEADER_GAP } from "@/shared/lib/insets";
import { formatAnyPhone } from "@/shared/lib/phone";
import { useT } from "@/shared/i18n";

type Row = { key: string; icon: IconName; title: string; sub?: string; badge?: number; href: string };

// The client's profile as in the design: the navy card (photo, name, phone · LexGo ID, plan and invites chips, "edit"), three shortcuts
// (works, documents, payments), then the sections as rows of two cards — every panel the profile's old tabs held opens on its own page
// (/profile/section/…), the account screens and the settings on theirs. Theme, language, update, sign out and the version follow below.
export function ClientProfile({ user, onBack }: { user: User; onBack: () => void }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const photo = useClientProfile().data?.avatarUrl;
  const works = useWorks();
  const referral = useReferral().data;
  const consents = useConsents().data ?? [];
  const features = useMyFeatures().data;
  const plans = usePlans().data;
  const plan = features?.active ? plans?.find((p) => p.id === features.planId)?.name : "";
  const name = displayName(user) || user.phone || "";
  const goal = referral ? referral.eligibleAfter || 5 : 0;
  const todo = consents.filter(needsAction).length;
  const go = (href: string) => router.push(href as never);
  const sections: Row[] = [
    { key: "personal", icon: "user", title: t("profile.pp.personal"), sub: t("profile.pp.personalSub"), href: "/profile/section/personal" },
    { key: "family", icon: "users", title: t("profile.pp.family"), href: "/profile/section/family" },
    { key: "payments", icon: "credit-card", title: t("profile.pp.payPlan"), sub: t("profile.pp.payPlanSub"), href: "/profile/section/payments" },
    { key: "consents", icon: "check-square", title: t("profile.pp.consents"), badge: todo, href: "/profile/consents" },
    { key: "complaints", icon: "message-square", title: t("profile.pp.complaints"), href: "/complaints" },
    { key: "gifts", icon: "gift", title: t("profile.pp.gifts"), href: "/profile/gifts" },
    { key: "referral", icon: "user-plus", title: t("profile.pp.referral"), sub: referral ? t("profile.pp.invites", { n: Math.min(referral.joined, goal), goal }) : undefined, href: "/profile/referral" },
  ];
  const settings: Row[] = [
    { key: "security", icon: "lock", title: t("profile.pp.security"), sub: t("profile.pp.securitySub"), href: "/profile/section/security" },
    { key: "notif", icon: "bell", title: t("profile.pp.notif"), href: "/settings/notifications" },
    { key: "lock", icon: "shield", title: t("profile.pp.lock"), href: "/settings/security-lock" },
    { key: "storage", icon: "database", title: t("profile.pp.storage"), href: "/settings/storage" },
    { key: "activity", icon: "clock", title: t("profile.pp.activity"), sub: t("profile.pp.activitySub"), href: "/profile/section/activity" },
    { key: "help", icon: "help-circle", title: t("profile.pp.help"), href: "/support" },
  ];
  const tiles: { key: string; icon: IconName; title: string; sub: string; href: string }[] = [
    { key: "works", icon: "briefcase", title: t("profile.pp.works"), sub: t("profile.pp.worksSub", { n: works.items.filter((w) => isOpenWork(w.status)).length }), href: "/(tabs)/works" },
    { key: "docs", icon: "file", title: t("profile.pp.docs"), sub: t("cl1.list.docs"), href: "/documents" },
    { key: "pay", icon: "credit-card", title: t("profile.pp.payments"), sub: t("profile.pp.paymentsSub"), href: "/payments" },
  ];
  const list = (title: string, rows: Row[]) => (
    <View style={s.group}>
      <Text variant="caption" weight="bold" tone="gray" style={s.head}>{title.toUpperCase()}</Text>
      <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
        {rows.map((r, i) => (
          <Fragment key={r.key}>
            <PressableScale onPress={() => go(r.href)} scale={0.99} accessibilityRole="button" style={s.row}>
              <View style={[s.ico, { backgroundColor: c.surface2 }]}><Icon name={r.icon} size={19} color={c.accent} /></View>
              <View style={s.flex}>
                <Text variant="h4" numberOfLines={1}>{r.title}</Text>
                {r.sub ? <Text variant="small" tone="gray" numberOfLines={1}>{r.sub}</Text> : null}
              </View>
              {r.badge ? <View style={s.badge}><Text variant="caption" weight="bold" style={s.badgeTx}>{r.badge}</Text></View> : null}
              <Icon name="chevron-right" size={18} tone="gray" />
            </PressableScale>
            {i < rows.length - 1 ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
          </Fragment>
        ))}
      </View>
    </View>
  );
  return (
    <View style={{ paddingTop: insets.top + HEADER_GAP }}>
      <View style={s.top}>
        <IconButton icon={backIcon} onPress={onBack} />
        <Text variant="h2">{t("profile.pp.title")}</Text>
      </View>
      <LinearGradient colors={["#14295F", "#1D3D8F", "#2856B4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.who}>
          <View style={s.ring}><Avatar name={name} uri={photo} size={68} /></View>
          <View style={s.flex}>
            <Text variant="caption" weight="bold" style={s.kicker}>{t("profile.pp.kicker").toUpperCase()}</Text>
            <Text variant="h3" tone="white" numberOfLines={2}>{name}</Text>
            <Text variant="small" style={s.dim} numberOfLines={2}>{[user.phone ? formatAnyPhone(user.phone) : "", user.lexgoId ? `${t("profile.lexgoId")}: ${user.lexgoId}` : ""].filter(Boolean).join(" · ")}</Text>
          </View>
        </View>
        {plan || referral ? (
          <View style={s.chips}>
            {plan ? <View style={s.chip}><Text variant="caption" weight="bold" tone="white">{plan}</Text></View> : null}
            {referral ? <View style={s.chip}><Text variant="caption" weight="bold" tone="white">{t("profile.pp.invites", { n: Math.min(referral.joined, goal), goal })}</Text></View> : null}
          </View>
        ) : null}
        <PressableScale onPress={() => go("/profile/section/personal")} scale={0.97} accessibilityRole="button" style={s.edit}>
          <Text variant="body" weight="bold" style={{ color: "#0B1636" }}>{t("profile.pp.edit")}</Text>
        </PressableScale>
      </LinearGradient>
      <View style={s.tiles}>
        {tiles.map((x) => (
          <PressableScale key={x.key} onPress={() => go(x.href)} scale={0.97} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={[s.ico, { backgroundColor: c.surface2 }]}><Icon name={x.icon} size={19} color={c.accent} /></View>
            <Text variant="h4" numberOfLines={1}>{x.title}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{x.sub}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={{ marginTop: 14 }}><HeaderExtra /></View>
      {list(t("profile.pp.sections"), sections)}
      {list(t("profile.pp.settings"), settings)}
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, marginBottom: 14 },
  hero: { marginHorizontal: 16, borderRadius: 24, padding: 18, gap: 14 },
  who: { flexDirection: "row", alignItems: "center", gap: 14 },
  ring: { padding: 3, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.18)" },
  kicker: { color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  dim: { color: "rgba(255,255,255,0.8)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  edit: { backgroundColor: "#FFFFFF", borderRadius: 16, minHeight: 50, alignItems: "center", justifyContent: "center" },
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 12 },
  tile: { flex: 1, gap: 6, padding: 14, borderRadius: 20, borderWidth: 1 },
  group: { gap: 10, paddingHorizontal: 16, marginTop: 22 },
  head: { letterSpacing: 0.8, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 13 },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 70 },
  ico: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  badge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#FDEBDD" },
  badgeTx: { color: "#A3471A" },
});
