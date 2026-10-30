import { ScrollView, View } from "react-native";
import { IdentityCard } from "@/widgets/identity";
import { NotifPrefsCard, TelegramCard, TwoFactorCard } from "@/widgets/security";
import { ActivityPanel, CardsPanel, EventsPanel, FamilyPanel, PaymentsPanel, PersonalPanel, SessionsPanel, SubscriptionPanel } from "@/widgets/client-profile";
import { AdminPage } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

export type ProfileSection = "personal" | "family" | "security" | "payments" | "activity";

// The client profile's sections on their own pages — the very panels the profile's tabs held, in the same order:
//   personal:   Shaxsiy ma'lumotlar → Shaxsni tasdiqlash      family:     Oila a'zolari
//   security:   2FA → Telegram → Xabarnoma → Aktiv sessiyalar            payments:   To'lov usullari → Obuna → To'lovlar tarixi
//   (complaints have one page for everyone: /complaints)       activity:   Xavfsizlik hodisalari → Harakatlar jurnali
const BODY: Record<ProfileSection, { title: string; body: () => React.ReactNode }> = {
  personal: { title: "profile.pp.personal", body: () => <><PersonalPanel /><IdentityCard /></> },
  family: { title: "profile.pp.family", body: () => <FamilyPanel /> },
  security: { title: "profile.pp.security", body: () => <><TwoFactorCard /><TelegramCard /><NotifPrefsCard /><SessionsPanel /></> },
  payments: { title: "profile.pp.payPlan", body: () => <><CardsPanel /><SubscriptionPanel /><PaymentsPanel /></> },
  activity: { title: "profile.pp.activity", body: () => <><EventsPanel /><ActivityPanel /></> },
};

export function ProfileSectionPage({ section }: { section: string }) {
  const { t } = useT();
  const insets = useInsets();
  const s = BODY[section as ProfileSection];
  if (!s) return <NotFoundPage />;
  return (
    <AdminPage title={t(s.title)}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        <View style={{ gap: 14 }}>{s.body()}</View>
      </ScrollView>
    </AdminPage>
  );
}
