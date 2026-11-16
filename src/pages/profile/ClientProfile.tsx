import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Award,
  Bell,
  Briefcase,
  ClipboardList,
  Package,
  ShieldCheck,
  Star,
  Target,
  CircleHelp,
  Clock,
  CreditCard,
  Database,
  File,
  Gift,
  Lock,
  MessageSquare,
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
import { useActiveWorks } from "@/widgets/client-dash";
import { AppSettings } from "@/widgets/profile";
import { PressableScale, Text } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { ProfileBandPage, ProfileIconTile, ProfileList, type ProfileRow } from "@/shared/ui/profile";
import { radius, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { DIGITAL_SALES, storeRows } from "@/shared/store-rules";

type Row = { key: string; icon: LucideIcon; title: string; sub?: string; badge?: number; href: string };

// The client's profile (ProfileBandPage): the band (photo, name, phone · LexGo ID, plan and invites chips, the pencil to edit), three shortcuts
// (works, documents, payments), then the sections as rows of two cards — every panel the profile's old tabs held opens on its own page
// (/profile/section/…), the account screens and the settings on theirs. Theme, language, update, sign out and the version follow below.
export function ClientProfile({ user, onBack, leading, bottomPad, aiFab }: { user: User; onBack?: () => void; leading?: ReactNode; bottomPad?: number; aiFab?: boolean }) {
  const { t } = useT();
  const { colors: c } = useTheme();
  const router = useRouter();
  const photo = useClientProfile().data?.avatarUrl;
  // The same active works as Home's "Faol ishlar" (the unfinished marketplace orders): the old count read client_works, which the backend
  // closes to the client role, so it always said 0.
  const activeWorks = useActiveWorks().active.length;
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
    { key: "personal", icon: UserIcon, title: t("profile.pp.personal"), sub: t("profile.pp.personalSub"), href: "/profile/section/personal" },
    { key: "family", icon: Users, title: t("profile.pp.family"), href: "/profile/section/family" },
    // "To'lovlar va obuna" is the "To'lovlar" tile under the header now — the same screen is not listed twice.
    // { key: "payments", icon: CreditCard, title: t("profile.pp.payPlan"), sub: t("profile.pp.payPlanSub"), href: "/profile/section/payments" },
    { key: "consents", icon: SquareCheck, title: t("profile.pp.consents"), badge: todo, href: "/profile/consents" },
    { key: "complaints", icon: MessageSquare, title: t("profile.pp.complaints"), href: "/complaints" },
    ...(DIGITAL_SALES ? [{ key: "gifts", icon: Gift, title: t("profile.pp.gifts"), href: "/profile/gifts" } as Row] : []),
    { key: "referral", icon: UserPlus, title: t("profile.pp.referral"), sub: referral ? t("profile.pp.invites", { n: Math.min(referral.joined, goal), goal }) : undefined, href: "/profile/referral" },
  ];
  // The rows that lived in the drawer (the menu button is gone from the Profil tab): the problem intake, packages, matched advocates, plans,
  // ratings and reviews, the guarantee. Store builds drop what the store rules forbid, as the drawer did.
  const more: Row[] = storeRows([
    { key: "intake", icon: ClipboardList, title: t("cpd.menu.intake"), href: "/intake" },
    { key: "packages", icon: Package, title: t("cpd.menu.packages"), href: "/packages" },
    { key: "matches", icon: Target, title: t("cpd.menu.matches"), href: "/matches" },
    { key: "subscription", icon: Award, title: t("cpd.menu.subscription"), href: "/subscription" },
    { key: "reviews", icon: Star, title: t("cpd.menu.reviews"), href: "/ratings" },
    { key: "warranty", icon: ShieldCheck, title: t("cpd.menu.warranty"), href: "/warranty" },
  ], (r) => r.href);
  const settings: Row[] = [
    { key: "security", icon: Lock, title: t("profile.pp.security"), sub: t("profile.pp.securitySub"), href: "/profile/section/security" },
    { key: "notif", icon: Bell, title: t("profile.pp.notif"), href: "/settings/notifications" },
    { key: "lock", icon: Shield, title: t("profile.pp.lock"), href: "/settings/security-lock" },
    { key: "storage", icon: Database, title: t("profile.pp.storage"), href: "/settings/storage" },
    { key: "activity", icon: Clock, title: t("profile.pp.activity"), sub: t("profile.pp.activitySub"), href: "/profile/section/activity" },
    { key: "help", icon: CircleHelp, title: t("profile.pp.help"), href: "/support" },
  ];
  const tiles: { key: string; icon: LucideIcon; title: string; sub: string; href: string }[] = [
    { key: "works", icon: Briefcase, title: t("profile.pp.works"), sub: t("profile.pp.worksSub", { n: activeWorks }), href: "/(tabs)/orders" },
    { key: "docs", icon: File, title: t("profile.pp.docs"), sub: t("cl1.list.docs"), href: "/documents" },
    { key: "pay", icon: CreditCard, title: t("profile.pp.payments"), sub: t("profile.pp.paymentsSub"), href: "/profile/section/payments" },
  ];
  const rows = (list: Row[]): ProfileRow[] => list.map(({ href, ...r }) => ({ ...r, onPress: () => go(href) }));
  const chips = [plan, referral ? t("profile.pp.invites", { n: Math.min(referral.joined, goal), goal }) : ""].filter(Boolean) as string[];
  return (
    <ProfileBandPage
      name={name}
      photo={photo}
      phone={user.phone}
      line={user.lexgoId ? `${t("profile.lexgoId")}: ${user.lexgoId}` : undefined}
      chips={chips}
      onBack={onBack}
      leading={leading}
      bottomPad={bottomPad}
      aiFab={aiFab}
      onEdit={() => go("/profile/section/personal")}
      editLabel={t("profile.pp.edit")}
    >
      <View style={s.tiles}>
        {tiles.map((x, i) => (
          <PressableScale key={x.key} onPress={() => go(x.href)} scale={0.97} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
            <ProfileIconTile icon={x.icon} order={i} />
            <Text variant="h4" weight="semibold" numberOfLines={1} style={s.title}>{x.title}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{x.sub}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={{ marginTop: 14 }}><HeaderExtra /></View>
      <ProfileList title={t("profile.pp.sections")} rows={rows(sections)} first={tiles.length} />
      <ProfileList title={t("cdash.home.services")} rows={rows(more)} first={tiles.length + sections.length} />
      <ProfileList title={t("profile.pp.settings")} rows={rows(settings)} first={tiles.length + sections.length + more.length} />
      <AppSettings soft />
    </ProfileBandPage>
  );
}

const s = StyleSheet.create({
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  tile: { flex: 1, gap: 6, padding: 14, borderRadius: radius.rl, borderWidth: 1 },
  title: { fontSize: 15, lineHeight: 20 },
});
