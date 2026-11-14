import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Award,
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  Clock,
  CreditCard,
  Database,
  Lock,
  Mail,
  MapPin,
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
import { needsAction, useClientProfile, useConsents, useMethods } from "@/entities/profile-extras";
import { regionKeyOf, useMyProfile } from "@/entities/pro-profile";
import { displayName, type User } from "@/entities/session";
import { AppSettings } from "@/widgets/profile";
import { Text } from "@/shared/ui";
import { ProfileBandPage, ProfileList, type ProfileRow } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { storeRows } from "@/shared/store-rules";

type Row = { key: string; icon: LucideIcon; title: string; sub?: string; badge?: number; href: string };

// /profile of an advokat or a yurist, in the client profile's look: the blue band carries who I am — photo, name, phone · LexGo ID, the
// role (and "verified") chips and, in small type under them, e-mail, bank card and address. Below it nothing but rows of white cards with
// Lucide icons, each opening its own page: the work profile (personal data with identity verification, family members, working hours,
// experience, achievements), payments and documents (receipts, consents, complaints and ratings, the Tezkor Himoya guarantee) and the
// settings (security, app lock, notifications, storage, the help centre). Theme, language, sign out and the version follow. The drawer no longer lists these.
export function SellerProfile({ user, onBack }: { user: User; onBack: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const account = useClientProfile().data; // the account record (name, e-mail, photo) — the same one "Shaxsiy ma'lumotlar" edits
  const pro = useMyProfile().data;
  const card = useMethods().data?.[0];
  const verified = !!useIdentity().data?.verified || !!pro?.verified;
  const consents = (useConsents().data ?? []).filter(needsAction).length;
  const go = (href: string) => router.push(href as never);

  const role = t(user.role === "advocate" ? "profile.roleAdvocate" : "profile.roleLawyer");
  const region = pro?.region ? (regionKeyOf(pro.region) ? t(`lawyers.regions.${regionKeyOf(pro.region)}`) : pro.region) : "";
  const address = [region, pro?.district].filter(Boolean).join(", ");
  const facts: { key: string; icon: LucideIcon; text: string }[] = [
    { key: "email", icon: Mail, text: account?.email || t("cpr.notSet") },
    { key: "card", icon: CreditCard, text: card ? `•••• ${card.last4}` : t("cpr.notSet") },
    { key: "address", icon: MapPin, text: address || t("cpr.notSet") },
  ];

  const work: Row[] = [
    { key: "personal", icon: UserIcon, title: t("py9.menu.edit"), sub: t("profile.pp.seller.personalSub"), href: "/profile/section/personal" },
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
  const rows = (list: Row[]): ProfileRow[] => list.map(({ href, ...r }) => ({ ...r, onPress: () => go(href) }));

  return (
    <ProfileBandPage
      name={displayName(user) || account?.name || user.phone || ""}
      photo={account?.avatarUrl || undefined}
      phone={user.phone}
      line={user.lexgoId ? `${t("profile.lexgoId")}: ${user.lexgoId}` : undefined}
      chips={[role, verified ? t("cpr.verifiedProfile") : ""].filter(Boolean)}
      onBack={onBack}
      onEdit={() => go("/profile/section/personal")}
      editLabel={t("profile.pp.edit")}
      bandExtra={
        <View style={s.facts}>
          {facts.map(({ key, icon: Glyph, text }) => (
            <View key={key} style={s.fact}>
              <Glyph size={13} color="rgba(255,255,255,0.85)" />
              <Text variant="caption" numberOfLines={1} style={s.factTx}>{text}</Text>
            </View>
          ))}
        </View>
      }
    >
      <ProfileList title={t("profile.pp.seller.work")} rows={rows(work)} />
      <ProfileList title={t("profile.pp.seller.money")} rows={rows(money)} first={work.length} />
      <ProfileList title={t("profile.pp.settings")} rows={rows(settings)} first={work.length + money.length} />
      <AppSettings soft />
    </ProfileBandPage>
  );
}

const s = StyleSheet.create({
  facts: { gap: 4 },
  fact: { flexDirection: "row", alignItems: "center", gap: 6 },
  factTx: { flex: 1, color: "rgba(255,255,255,0.85)" },
});
