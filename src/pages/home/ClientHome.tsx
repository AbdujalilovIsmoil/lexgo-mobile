import { View } from "react-native";
import { HeroScroll, TabletColumn } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useIsAuthed } from "@/entities/session";
import { DashAsk, DashGuest, DashHero, DashQuick, DashReferral, DashRequests, DashTiles } from "@/widgets/client-dash";

// Client dashboard (no header banner here, unlike the other tabs): the dark hero (header row + the question) with the ask field on its bottom edge → the four ways in (2×2) →
// urgent advocate | car accident, SOS → active requests → referral progress. Everything, the header row included, scrolls together.
export function ClientHome() {
  const c = useColors();
  const insets = useInsets();
  const authed = useIsAuthed();
  return (
    <HeroScroll style={{ backgroundColor: c.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
      <DashHero />
      <DashAsk />
      <TabletColumn>
        <DashTiles />
        <DashQuick />
        {authed ? <><DashRequests /><DashReferral /></> : <><View style={{ height: 16 }} /><DashGuest /></>}
      </TabletColumn>
    </HeroScroll>
  );
}
