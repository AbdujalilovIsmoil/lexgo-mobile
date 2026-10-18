import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { Dict } from "@/shared/lib/json";
import type { PolicySection } from "@/entities/admin-policies";
import { CalendarCard } from "./CalendarCard";
import { PolicySections } from "./PolicySections";
import { PricingCard } from "./PricingCard";
import { ReadinessCard } from "./ReadinessCard";
import { UnverifiedCard } from "./UnverifiedCard";

export type PolicyTab = "ready" | "policies" | "pricing" | "platform";
type Props = { tab: PolicyTab; onHistory: (s: PolicySection) => void; seed: Dict | null; onSeedUsed: () => void };

// The block of the selected tab (readiness / six policies / pricing / unverified switch + calendar), faded in on change.
export function PolicyBody({ tab, onHistory, seed, onSeedUsed }: Props) {
  return (
    <Animated.View key={tab} entering={FadeInUp.duration(220)} style={{ gap: 12 }}>
      {tab === "ready" ? <ReadinessCard /> : null}
      {tab === "policies" ? <PolicySections onHistory={onHistory} /> : null}
      {tab === "pricing" ? <PricingCard onHistory={() => onHistory("marketplace_pricing")} seed={seed} onSeedUsed={onSeedUsed} /> : null}
      {tab === "platform" ? <View style={{ gap: 12 }}><UnverifiedCard /><CalendarCard /></View> : null}
    </Animated.View>
  );
}
