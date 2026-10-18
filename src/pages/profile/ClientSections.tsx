import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { IdentityCard } from "@/widgets/identity";
import { TelegramCard, TwoFactorCard, NotifPrefsCard } from "@/widgets/security";
import { ActivityPanel, CardsPanel, ComplaintsPanel, EventsPanel, FamilyPanel, PaymentsPanel, PersonalPanel, PROFILE_TABS, ProfileTabs, SessionsPanel, SubscriptionPanel, type ProfileTab } from "@/widgets/client-profile";

const order = (t: ProfileTab) => PROFILE_TABS.findIndex((x) => x.key === t);

// The web client profile (portal/client/profile) split into five tabs; inside each tab the sections keep the web order.
//   Profil:      Shaxsiy ma'lumotlar → Shaxsni tasdiqlash → Oila a'zolari
//   Xavfsizlik:  2FA → Telegram → Xabarnoma sozlamalari → Aktiv sessiyalar
//   To'lovlar:   To'lov usullari → Obuna → To'lovlar tarixi (the web "To'lovlar" page)
//   Shikoyatlar: hero + notes → the complaints list (+ new complaint)
//   Faollik:     Xavfsizlik hodisalari → Harakatlar jurnali
// Switching slides the new tab's content in from the side the tab lies on, while the tab bar's background glides.
export function ClientSections() {
  const [nav, setNav] = useState<{ tab: ProfileTab; dir: 1 | -1 }>({ tab: "profile", dir: 1 });
  const { tab, dir } = nav;
  const go = (next: ProfileTab) => setNav({ tab: next, dir: order(next) >= order(tab) ? 1 : -1 });
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 14 }}>
      <ProfileTabs value={tab} onChange={go} />
      <Animated.View key={tab} entering={(dir === 1 ? FadeInRight : FadeInLeft).duration(320)} style={{ gap: 14 }}>
        {tab === "profile" ? <><PersonalPanel /><IdentityCard /><FamilyPanel /></> : null}
        {tab === "security" ? <><TwoFactorCard /><TelegramCard /><NotifPrefsCard /><SessionsPanel /></> : null}
        {tab === "payments" ? <><CardsPanel /><SubscriptionPanel /><PaymentsPanel /></> : null}
        {tab === "complaints" ? <ComplaintsPanel /> : null}
        {tab === "activity" ? <><EventsPanel /><ActivityPanel /></> : null}
      </Animated.View>
    </View>
  );
}
