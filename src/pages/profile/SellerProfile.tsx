import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Award,
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  Clock,
  Database,
  FolderOpen,
  LayoutGrid,
  SquareCheckBig,
  Lock,
  MessageSquareWarning,
  Receipt,
  ScanFace,
  ShieldCheck,
  SquareCheck,
  User as UserIcon,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { useIdentity } from "@/entities/identity";
import { needsAction, useClientProfile, useConsents } from "@/entities/profile-extras";
import { useMyProfile } from "@/entities/pro-profile";
import { displayName, type User } from "@/entities/session";
import { AppSettings } from "@/widgets/profile";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { fmtRating } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { useMyRating } from "@/entities/lawyer";
import { useMyFeatures, usePlans } from "@/entities/plan";
import { useRequestCounts } from "@/entities/pro-requests";
import { isDone, useTasks } from "@/entities/pro-tasks";
import { useTree } from "@/entities/pro-files";
import { useProServices } from "@/entities/pro-service";
import { ProfileFillCard } from "@/widgets/seller-home";
import { ProfileBandPage, ProfileIconTile, ProfileList, type ProfileRow } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { useAccess } from "@/entities/access";
import { groupTasks, useCabinet } from "@/entities/pro-workspace";
import { todayKey } from "@/shared/lib/pro/dates";
import { useBadge } from "@/shared/lib/badgeStore";
import { sellerSections, TEAM_TASKS, type NavItem } from "@/widgets/client-sidebar/navItems";
import { storeRows } from "@/shared/store-rules";

// The drawer's rows carry Feather icon names; the profile's list draws Lucide-style components (size, color) — this wraps one.
const glyphs = new Map<string, LucideIcon>();
function featherGlyph(name: string): LucideIcon {
  let g = glyphs.get(name);
  if (!g) {
    const Glyph = ({ size, color }: { size?: number | string; color?: string }) => <Feather name={name as ComponentProps<typeof Feather>["name"]} size={Number(size) || 20} color={color} />;
    g = Glyph as unknown as LucideIcon;
    glyphs.set(name, g);
  }
  return g;
}

type Row = { key: string; icon: LucideIcon; title: string; sub?: string; badge?: number; href: string };

// /profile of an advokat or a yurist, in the client profile's look: the blue band carries who I am — photo, name, phone · LexGo ID, the
// role (and "verified") chips and, in small type under them, e-mail, bank card and address. Below it nothing but rows of white cards with
// Lucide icons, each opening its own page: the work profile (personal data with identity verification, family members, working hours,
// experience, achievements), payments and documents (receipts, consents, complaints and ratings, the Tezkor Himoya guarantee) and the
// settings (security, app lock, notifications, storage, the help centre). Theme, language, sign out and the version follow. The drawer no longer lists these.
export function SellerProfile({ user, onBack, bottomPad }: { user: User; onBack?: () => void; bottomPad?: number }) {
  const { t, locale } = useT();
  const { colors: c } = useTheme();
  const router = useRouter();
  const account = useClientProfile().data; // the account record (name, e-mail, photo) — the same one "Shaxsiy ma'lumotlar" edits
  const pro = useMyProfile().data;
  const verified = !!useIdentity().data?.verified || !!pro?.verified;
  const consents = (useConsents().data ?? []).filter(needsAction).length;
  const go = (href: string) => router.push(href as never);

  const role = t(user.role === "advocate" ? "profile.roleAdvocate" : "profile.roleLawyer");
  // The band's glass box (Adliya): licence number, years of experience, rating · reviews, the plan.
  const rating = useMyRating(true).data;
  const features = useMyFeatures().data;
  const plans = usePlans().data;
  const plan = features?.active ? plans?.find((p) => p.id === features.planId)?.name ?? t("cdash.side.myPlan") : t("shm.ws.freePlan");
  const facts: { key: string; label: string; value: string }[] = [
    // Guvohnoma and Tajriba moved to "Shaxsiy ma'lumotlarim" (pages/profile/SellerFacts).
    { key: "rating", label: t("mkd.stats.rating"), value: rating?.rated ? `${fmtRating(rating.rating, locale)} · ${rating.reviews}` : t("shm.ws.ratingNew") },
    { key: "plan", label: t("profile.pp.seller.plan"), value: plan },
  ];
  const areas = (pro?.specializations ?? []).map((k) => tOr(t, `services.areas.${k}`, k)).join(", ");
  // Three shortcuts under the band (the web portal's Vazifalar, Fayllar, Xizmatlarim): the open tasks (GET /tasks/me), the files of the workspace
  // (GET /workspace/tree), the services that are on (GET /lawyers/me/services/manage) — each opening its page.
  const counts = useRequestCounts().counts;
  const cases = groupTasks(useCabinet().data?.cases ?? [], todayKey()); // the same open cases the home counts
  const activeCases = cases.today.length + cases.upcoming.length;
  const taskList = useTasks().data;
  const fileList = useTree().data?.files;
  const svcList = useProServices().data?.items;
  const openTasks = (taskList ?? []).filter((x) => !isDone(x)).length;
  const tiles: { key: string; icon: LucideIcon; title: string; sub: string; href: string }[] = [
    { key: "tasks", icon: SquareCheckBig, title: t("lsb.tasks"), sub: taskList ? t("profile.pp.seller.tasksN", { n: openTasks }) : "—", href: "/pro/tasks" },
    { key: "files", icon: FolderOpen, title: t("lsb.files"), sub: fileList ? t("profile.pp.seller.filesN", { n: fileList.length }) : "—", href: "/pro/files" },
    { key: "services", icon: LayoutGrid, title: t("lsb.services"), sub: svcList ? t("profile.pp.seller.servicesN", { n: svcList.filter((x) => x.status === "active").length }) : "—", href: "/pro/services" },
  ];

  const work: Row[] = [
    // "Shaxsiy ma'lumotlarim" is the last row of Asosiy now (personalRow).
    { key: "family", icon: Users, title: t("py9.menu.family"), sub: t("py9.menu.familySub"), href: "/profile/family" },
    { key: "availability", icon: Clock, title: t("nav1.menu.availability"), sub: t("profile.pp.seller.availabilitySub"), href: "/pro/availability" },
    { key: "experience", icon: BriefcaseBusiness, title: t("mf.exp.menu"), sub: t("profile.pp.seller.experienceSub"), href: "/pro/experience" },
    { key: "achievements", icon: Award, title: t("ach.menu"), sub: t("profile.pp.seller.achievementsSub"), href: "/pro/achievements" },
  ];
  const money: Row[] = storeRows(
    [
      { key: "payments", icon: Receipt, title: t("py9.menu.payments"), sub: t("py9.menu.paymentsSub"), href: "/payments" },
      { key: "consents", icon: SquareCheck, title: t("py9.menu.consents"), sub: t("py9.menu.consentsSub"), badge: consents, href: "/profile/consents" },
      { key: "complaints", icon: MessageSquareWarning, title: t("py9.menu.complaints"), sub: t("py9.menu.complaintsSub"), href: "/complaints" },
      { key: "warranty", icon: ShieldCheck, title: t("py9.menu.warranty"), sub: t("py9.menu.warrantySub"), href: "/warranty" },
    ],
    (r) => r.href,
  );
  const settings: Row[] = [
    { key: "security", icon: Lock, title: t("nav1.menu.security"), sub: t("profile.pp.securitySub"), href: "/security" },
    { key: "lock", icon: ScanFace, title: t("nav1.menu.lock"), sub: t("profile.pp.seller.lockSub"), href: "/settings/security-lock" },
    { key: "notif", icon: Bell, title: t("nav1.menu.notifSettings"), sub: t("profile.pp.seller.notifSub"), href: "/settings/notifications" },
    { key: "storage", icon: Database, title: t("nav1.menu.storage"), sub: t("profile.pp.seller.storageSub"), href: "/settings/storage" },
    { key: "help", icon: CircleHelp, title: t("profile.pp.help"), sub: t("profile.pp.seller.helpSub"), href: "/support" },
  ];
  // The rows the drawer held (the drawer button is gone): the day's work, tools, growth, account and app screens, help — with the same
  // permission rules (an account under review, the cabinet's actions) and the team's tasks for whoever holds tasks.view.
  const cabinet = useCabinet().data;
  const access = useAccess();
  const supportBadge = useBadge("support");
  const drawer = sellerSections({ kind: user.role, limited: cabinet ? cabinet.limited : user.accountStatus === "pending", actions: cabinet?.actions });
  // A small line under every row (Adliya): the live number where there is one, else what the screen is for.
  const live: Record<string, string | undefined> = {
    cases: t("profile.pp.worksSub", { n: activeCases }),
    documentRequests: t("profile.pp.seller.waitingN", { n: counts.docs }),
    urgentAssigned: counts.urgent ? t("profile.pp.seller.waitingN", { n: counts.urgent }) : undefined,
    marketplaceOrders: counts.orders ? t("profile.pp.seller.waitingN", { n: counts.orders }) : undefined,
    subscription: plan,
    stats: rating?.rated ? `${fmtRating(rating.rating, locale)} · ${t("lw.reviews", { n: rating.reviews })}` : undefined,
  };
  const subOf = (key: string) => live[key] ?? (tOr(t, `profile.pp.rowSub.${key}`, "") || undefined);
  // Hozircha kerak emas: Xizmat buyurtmalari, Paketlarim, Xizmatlarim qatorlari (Xizmatlarim — yuqoridagi plitkada).
  const HIDDEN = new Set(["marketplaceOrders", "proPackages", "services"]);
  const drawerRows = (items: NavItem[]): Row[] => items.filter((it) => !HIDDEN.has(it.key)).map((it) => ({ key: `d-${it.key}`, icon: featherGlyph(it.icon), title: t(it.label ?? `cpd.menu.${it.key}`), sub: subOf(it.key), badge: it.badge === "support" ? supportBadge || undefined : undefined, href: it.route }));
  const team: Row[] = access.can("tasks.view") ? drawerRows([TEAM_TASKS]) : [];
  const personalRow: Row = { key: "personal", icon: UserIcon, title: t("profile.pp.seller.personalMine"), sub: t("profile.pp.seller.personalSub"), href: "/profile/section/personal" };
  const rows = (list: Row[]): ProfileRow[] => list.map(({ href, ...r }) => ({ ...r, onPress: () => go(href) }));

  return (
    <ProfileBandPage
      name={displayName(user) || account?.name || user.phone || ""}
      photo={account?.avatarUrl || undefined}
      round
      line={[role, areas].filter(Boolean).join(" · ") || undefined}
      chips={verified ? [t("cpr.verifiedProfile")] : undefined}
      onBack={onBack}
      bottomPad={bottomPad}
      onEdit={() => go("/profile/section/personal")}
      editLabel={t("profile.pp.edit")}
      underName={
        <View style={s.box}>
          {facts.map((f) => (
            <View key={f.key} style={s.fact}>
              <Text variant="caption" numberOfLines={1} style={s.factLabel}>{f.label}</Text>
              <Text variant="small" weight="bold" numberOfLines={1} style={s.factValue}>{f.value}</Text>
            </View>
          ))}
        </View>
      }
      bandExtra={<ProfileFillCard onBand />}
    >
      <View style={s.tiles}>
        {tiles.map((x, i) => (
          <PressableScale key={x.key} onPress={() => go(x.href)} scale={0.97} accessibilityRole="button" accessibilityLabel={`${x.title}, ${x.sub}`} style={[s.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
            <ProfileIconTile icon={x.icon} order={i} />
            <Text variant="h4" weight="bold" numberOfLines={1} style={s.tileT}>{x.title}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{x.sub}</Text>
          </PressableScale>
        ))}
      </View>
      {drawer.filter((g) => g.key === "main").map((g) => <ProfileList key={g.key} title={t(`cdash.side.${g.key}`)} rows={rows([...team, ...drawerRows(g.items), personalRow])} />)}
      <ProfileList title={t("profile.pp.seller.work")} rows={rows(work)} />
      {drawer.filter((g) => g.key !== "main").map((g) => <ProfileList key={g.key} title={t(`cdash.side.${g.key}`)} rows={rows(drawerRows(g.items))} />)}
      <ProfileList title={t("profile.pp.seller.money")} rows={rows(money)} first={work.length} />
      <ProfileList title={t("profile.pp.settings")} rows={rows(settings)} first={work.length + money.length} />
      <AppSettings soft />
    </ProfileBandPage>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: "row", flexWrap: "wrap", rowGap: 6, marginTop: 8 },
  fact: { width: "50%", paddingRight: 6 },
  factLabel: { color: "#AFC0E0", fontSize: 11, lineHeight: 14 },
  factValue: { color: "#FFFFFF", fontSize: 13, lineHeight: 17 },
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  tile: { flex: 1, minWidth: 0, gap: 6, padding: 14, borderRadius: 20, borderWidth: 1 },
  tileT: { fontSize: 15, lineHeight: 20 },
});
