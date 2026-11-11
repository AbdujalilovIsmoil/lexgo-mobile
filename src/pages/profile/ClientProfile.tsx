import { Fragment, useState } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { interpolate, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Briefcase,
  ChevronRight,
  CircleHelp,
  Clock,
  CreditCard,
  Database,
  File,
  Gift,
  Lock,
  MessageSquare,
  Pencil,
  Phone,
  Shield,
  SquareCheck,
  User as UserIcon,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { displayName, type User } from "@/entities/session";
import { needsAction, useClientProfile, useConsents, useReferral } from "@/entities/profile-extras";
import { useMyFeatures, usePlans } from "@/entities/plan";
import { useOpenCases } from "@/entities/open-cases";
import { isFinal, useMine } from "@/entities/urgent";
import { HOME_BG } from "@/widgets/client-dash";
import { AppSettings } from "@/widgets/profile";
import { Avatar, FocusStatusBar, HeroScroll, IconButton, PressableScale, Text, backIcon } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { mainColor, radius, useTheme } from "@/shared/theme";
import { useInsets, HEADER_GAP, HEADER_ROW } from "@/shared/lib/insets";
import { formatAnyPhone } from "@/shared/lib/phone";
import { useT } from "@/shared/i18n";
import { DIGITAL_SALES } from "@/shared/store-rules";

type Row = { key: string; icon: LucideIcon; title: string; sub?: string; badge?: number; href: string };

const HEADER_COLORS = [mainColor, "#10499F"] as const;
const SHADOW_RIGHT = require("../../../assets/shadow1.png");
const SHADOW_LEFT = require("../../../assets/shadow2.png");
// The icon tiles' colours, handed out in order down the page. `fg: null` is the main colour, which the dark theme swaps for its lighter accent.
const TONES = [
  { bg: "#E6F0FF", fg: null },
  { bg: "#F0FDF4", fg: "#10B981" },
  { bg: "#FFF7ED", fg: "#F59E0B" },
  { bg: "#F5F3FF", fg: "#8B5CF6" },
  { bg: "#FEF2F2", fg: "#EF4444" },
  { bg: "#EFF6FF", fg: "#3B82F6" },
] as const;

const AVATAR = 64;
const SIDE = 16;
const NAME_LEFT = SIDE + AVATAR + 12; // the name's place in the band: after the avatar and its gap
const NAME_SIZE = 22;
const BAR_NAME_SIZE = 17;
const NAME_MOVE_MS = 260;
const BAR_NAME_DROP = 22; // how far below its place the bar's name starts

// The band's picture, also drawn in the fixed bar so that at rest the bar cannot be told from the band. `height`: the band's, so both match point for point.
function BandArt({ height }: { height?: number }) {
  return (
    <View pointerEvents="none" style={[s.art, height ? { height } : s.artFill]}>
      <LinearGradient colors={[...HEADER_COLORS]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Image source={SHADOW_RIGHT} style={s.shadowRight} />
      <Image source={SHADOW_LEFT} style={s.shadowLeft} />
    </View>
  );
}

// The client's profile: a fixed bar with the back button, under it the page that scrolls whole: the band (photo, name, phone · LexGo ID, plan and invites chips, the pencil
// to edit), three shortcuts (works, documents, payments), then the sections as rows of two cards — every panel the profile's old tabs held opens on its own page (/profile/section/…), the account
// screens and the settings on theirs. Theme, language, update, sign out and the version follow below.
// Once the name has gone half under the bar, the bar's own copy moves from the name's place to the middle; it goes back past a lower point. It runs on a timer, not with the
// scroll, so a finger's small moves do not shake it.
export function ClientProfile({ user, onBack }: { user: User; onBack: () => void }) {
  const { t } = useT();
  const { width } = useWindowDimensions();
  const [bandH, setBandH] = useState<number>();
  const [whoY, setWhoY] = useState(0);
  const [colY, setColY] = useState(0);
  const [nameW, setNameW] = useState(0);
  const scrollY = useSharedValue(0);
  const past = useSharedValue(false);
  const inBar = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const { colors: c, dark } = useTheme();
  const insets = useInsets();
  const router = useRouter();
  const photo = useClientProfile().data?.avatarUrl;
  const openCases = useOpenCases().open.length;
  const liveUrgent = (useMine().data ?? []).filter((r) => !isFinal(r)).length;
  const referral = useReferral().data;
  const consents = useConsents().data ?? [];
  const features = useMyFeatures().data;
  const plans = usePlans().data;
  const plan = features?.active ? plans?.find((p) => p.id === features.planId)?.name : "";
  const name = displayName(user) || user.phone || "";
  const goal = referral ? referral.eligibleAfter || 5 : 0;
  const todo = consents.filter(needsAction).length;
  const go = (href: string) => router.push(href as never);
  const barH = insets.top + HEADER_GAP + HEADER_ROW + 8;
  const on = whoY + colY - barH + NAME_SIZE / 2;
  const off = on - 12;
  // Until the band is measured (whoY is still 0) the threshold is meaningless (negative): the name stays in the band.
  const measured = whoY > 0;
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      const now = measured && (past.value ? y > off : y > on);
      if (now === past.value) return;
      past.value = now;
      inBar.value = withTiming(now ? 1 : 0, { duration: NAME_MOVE_MS });
    },
    [measured, on, off],
  );
  const grow = NAME_SIZE / BAR_NAME_SIZE;
  const startX = NAME_LEFT + (nameW * grow) / 2 - width / 2;
  const barName = useAnimatedStyle(() => ({
    opacity: interpolate(inBar.value, [0, 0.35], [0, 1], "clamp"),
    transform: [
      { translateX: startX * (1 - inBar.value) },
      { translateY: BAR_NAME_DROP * (1 - inBar.value) },
      { scale: 1 + (grow - 1) * (1 - inBar.value) },
    ],
  }));
  const sections: Row[] = [
    { key: "personal", icon: UserIcon, title: t("profile.pp.personal"), sub: t("profile.pp.personalSub"), href: "/profile/section/personal" },
    { key: "family", icon: Users, title: t("profile.pp.family"), href: "/profile/section/family" },
    // "To'lovlar va obuna" is the "To'lovlar" tile under the header now — the same screen is not listed twice.
    // { key: "payments", icon: CreditCard, title: t("profile.pp.payPlan"), sub: t("profile.pp.payPlanSub"), href: "/profile/section/payments" },
    { key: "consents", icon: SquareCheck, title: t("profile.pp.consents"), badge: todo, href: "/profile/consents" },
    { key: "complaints", icon: MessageSquare, title: t("profile.pp.complaints"), href: "/complaints" },
    ...(DIGITAL_SALES ? [{ key: "gifts", icon: Gift, title: t("profile.pp.gifts"), href: "/profile/gifts" } as Row] : []),
    { key: "referral", icon: UserPlus, title: t("profile.pp.referral"), sub: referral ? t("profile.pp.invites", { n: Math.min(referral.joined, goal), goal }) : undefined, href: "/profile/referral" },
  ];
  const settings: Row[] = [
    { key: "security", icon: Lock, title: t("profile.pp.security"), sub: t("profile.pp.securitySub"), href: "/profile/section/security" },
    { key: "notif", icon: Bell, title: t("profile.pp.notif"), href: "/settings/notifications" },
    { key: "lock", icon: Shield, title: t("profile.pp.lock"), href: "/settings/security-lock" },
    { key: "storage", icon: Database, title: t("profile.pp.storage"), href: "/settings/storage" },
    { key: "activity", icon: Clock, title: t("profile.pp.activity"), sub: t("profile.pp.activitySub"), href: "/profile/section/activity" },
    { key: "help", icon: CircleHelp, title: t("profile.pp.help"), href: "/support" },
  ];
  const tiles: { key: string; icon: LucideIcon; title: string; sub: string; href: string }[] = [
    { key: "works", icon: Briefcase, title: t("profile.pp.works"), sub: t("profile.pp.worksSub", { n: openCases + liveUrgent }), href: "/dashboard-lists/works" },
    { key: "docs", icon: File, title: t("profile.pp.docs"), sub: t("cl1.list.docs"), href: "/documents" },
    { key: "pay", icon: CreditCard, title: t("profile.pp.payments"), sub: t("profile.pp.paymentsSub"), href: "/profile/section/payments" },
  ];
  const tile = (Glyph: LucideIcon, order: number) => {
    const tone = TONES[order % TONES.length];
    return (
      <View style={[s.ico, { backgroundColor: dark ? c.surface2 : tone.bg }]}>
        <Glyph size={20} color={tone.fg ?? (dark ? c.accent : mainColor)} />
      </View>
    );
  };
  const list = (title: string, rows: Row[], first: number) => (
    <View style={s.group}>
      <Text variant="caption" weight="bold" tone="gray" style={s.head}>{title}</Text>
      <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
        {rows.map((r, i) => (
          <Fragment key={r.key}>
            <PressableScale onPress={() => go(r.href)} scale={0.99} accessibilityRole="button" style={s.row}>
              {tile(r.icon, first + i)}
              <View style={s.flex}>
                <Text variant="h4" weight="semibold" numberOfLines={1} style={s.title}>{r.title}</Text>
                {r.sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{r.sub}</Text> : null}
              </View>
              {r.badge ? <View style={s.badge}><Text variant="caption" weight="bold" style={s.badgeTx}>{r.badge}</Text></View> : null}
              <ChevronRight size={20} color={c.gray2} />
            </PressableScale>
            {i < rows.length - 1 ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
          </Fragment>
        ))}
      </View>
    </View>
  );
  return (
    <View style={[s.fill, { backgroundColor: dark ? c.canvas : HOME_BG }]}>
      <FocusStatusBar style="light" />
      <HeroScroll capColor={mainColor} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View onLayout={(e) => setBandH(e.nativeEvent.layout.height)} style={[s.band, { paddingTop: barH }]}>
          <BandArt />
          <View onLayout={(e) => setWhoY(e.nativeEvent.layout.y)} style={s.who}>
            <Avatar name={name} uri={photo} size={AVATAR} square />
            <View onLayout={(e) => setColY(e.nativeEvent.layout.y)} style={s.flex}>
              <Text variant="h3" tone="white" numberOfLines={2} style={s.name}>{name}</Text>
              {user.phone ? (
                <View style={s.phone}>
                  <Phone size={13} color="#FFFFFF" />
                  <Text variant="small" style={s.dim} numberOfLines={1}>{formatAnyPhone(user.phone)}</Text>
                </View>
              ) : null}
              {user.lexgoId ? <Text variant="caption" style={s.dim} numberOfLines={1}>{`${t("profile.lexgoId")}: ${user.lexgoId}`}</Text> : null}
            </View>
            <PressableScale onPress={() => go("/profile/section/personal")} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("profile.pp.edit")} style={s.edit}>
              <Pencil size={17} color="#FFFFFF" />
            </PressableScale>
          </View>
          {plan || referral ? (
            <View style={s.chips}>
              {plan ? <View style={s.chip}><Text variant="caption" weight="bold" tone="white">{plan}</Text></View> : null}
              {referral ? <View style={s.chip}><Text variant="caption" weight="bold" tone="white">{t("profile.pp.invites", { n: Math.min(referral.joined, goal), goal })}</Text></View> : null}
            </View>
          ) : null}
        </View>
        <View style={s.tiles}>
          {tiles.map((x, i) => (
            <PressableScale key={x.key} onPress={() => go(x.href)} scale={0.97} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
              {tile(x.icon, i)}
              <Text variant="h4" weight="semibold" numberOfLines={1} style={s.title}>{x.title}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{x.sub}</Text>
            </PressableScale>
          ))}
        </View>
        <View style={{ marginTop: 14 }}><HeaderExtra /></View>
        {list(t("profile.pp.sections"), sections, tiles.length)}
        {list(t("profile.pp.settings"), settings, tiles.length + sections.length)}
        <AppSettings soft />
      </HeroScroll>
      <View pointerEvents="box-none" style={[s.bar, { height: barH, paddingTop: insets.top + HEADER_GAP }]}>
        <BandArt height={bandH ?? barH} />
        <IconButton icon={backIcon} tone="glass" onPress={onBack} />
        <View pointerEvents="none" style={[s.barTitle, { top: insets.top + HEADER_GAP }]}>
          <Animated.View style={barName}>
            <Text variant="h3" tone="white" numberOfLines={1} onLayout={(e) => setNameW(e.nativeEvent.layout.width)} style={s.barName}>{name}</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  band: { paddingHorizontal: SIDE, paddingBottom: 18, gap: 12, overflow: "hidden" },
  art: { position: "absolute", top: 0, left: 0, right: 0, overflow: "hidden" },
  artFill: { bottom: 0 },
  bar: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: SIDE, overflow: "hidden" },
  barTitle: { position: "absolute", left: SIDE + HEADER_ROW + 8, right: SIDE + HEADER_ROW + 8, height: HEADER_ROW, alignItems: "center", justifyContent: "center" },
  barName: { fontSize: BAR_NAME_SIZE, lineHeight: 22 },
  shadowRight: { position: "absolute", top: 0, right: 0, width: 180, height: 180 },
  shadowLeft: { position: "absolute", bottom: 0, left: 0, width: 100, height: 100 },
  who: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: NAME_SIZE, lineHeight: 27 },
  phone: { flexDirection: "row", alignItems: "center", gap: 5 },
  dim: { color: "rgba(255,255,255,0.85)" },
  edit: { width: 34, height: 34, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(240,236,236,0.43)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(255,255,255,0.16)", borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  tile: { flex: 1, gap: 6, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  group: { gap: 8, paddingHorizontal: 16, marginTop: 20 },
  head: { letterSpacing: 1, marginLeft: 4 },
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rule: { height: 1 },
  ico: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 15, lineHeight: 20 },
  badge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#FDEBDD" },
  badgeTx: { color: "#A3471A" },
});
