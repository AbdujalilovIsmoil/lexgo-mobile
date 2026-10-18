import { HeroScroll } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { HomeHero } from "@/widgets/home-hero";
import { QuickActions } from "@/widgets/home-actions";
import { StatsRow } from "@/widgets/stats-row/StatsRow";
import { TopicsSection } from "@/widgets/topics";
import { TopLawyersRail } from "@/widgets/top-lawyers/TopLawyersRail";
import { DocBanner, SubscriptionBanner } from "@/widgets/promo-cards";
import { DashBody } from "@/widgets/admin-dash";
import { HrmFeature } from "@/widgets/home-hrm";
import { Warranty } from "./Warranty";

// Superadmin / admin Home: the usual Home design, with the web /admin overview (filters, KPI tiles,
// charts, payments, modules) added under the quick actions. Each tile opens its drill-down drawer.
export function StaffHome() {
  const c = useColors();
  const insets = useInsets();
  return (
    <HeroScroll style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
      <HomeHero />
      <StatsRow />
      <HrmFeature />
      <QuickActions />
      <DashBody inline />
      <DocBanner />
      <TopicsSection />
      <TopLawyersRail />
      <SubscriptionBanner />
      <Warranty />
    </HeroScroll>
  );
}
