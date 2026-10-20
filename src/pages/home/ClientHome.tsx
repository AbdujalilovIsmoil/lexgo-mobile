import { View } from "react-native";
import { HeroScroll } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { useIsAuthed } from "@/entities/session";
import { DashAiCard, DashGuest, DashHero, DashPromo, DashReferral, DashRequests } from "@/widgets/client-dash";

// Client dashboard, in the order of law-main portal/client/page.tsx: hero (header row, title, ask field, trust chips,
// the rail of six quick actions) → lawyer promo (+ the upsell banner) → active requests → referral progress → AI card.
// Everything, the header row included, scrolls together.
export function ClientHome() {
  const c = useColors();
  const insets = useInsets();
  const authed = useIsAuthed();
  return (
    <HeroScroll style={{ backgroundColor: c.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
      <DashHero />
      <View style={{ height: 16 }} />
      <HeaderExtra />
      <DashPromo />
      {authed ? <><DashRequests /><DashReferral /></> : <DashGuest />}
      <DashAiCard />
    </HeroScroll>
  );
}
