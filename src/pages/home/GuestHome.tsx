import { HeroScroll, TabletColumn } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { HomeHero } from "@/widgets/home-hero";
import { StatsRow } from "@/widgets/stats-row/StatsRow";
import { TopicsSection } from "@/widgets/topics";
import { TopLawyersRail } from "@/widgets/top-lawyers/TopLawyersRail";
import { DocBanner, SubscriptionBanner } from "@/widgets/promo-cards";
import { Warranty } from "./Warranty";

// Public landing for visitors: the owner-approved hero, platform numbers and promos.
export function GuestHome() {
  const c = useColors();
  const insets = useInsets();
  return (
    <HeroScroll style={{ backgroundColor: c.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
      <HomeHero />
      <TabletColumn>
        <StatsRow />
        <DocBanner />
        <TopicsSection />
        <TopLawyersRail />
        <SubscriptionBanner />
        <Warranty />
      </TabletColumn>
    </HeroScroll>
  );
}
