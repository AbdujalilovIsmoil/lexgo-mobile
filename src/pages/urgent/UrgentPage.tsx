import { ScrollView, View } from "react-native";
import { useClientFrame } from "@/widgets/client-dash";
import { ClientHeader, UrgentTop } from "@/widgets/urgent";
import { useTabClearance } from "@/widgets/tab-page";
import { useAiFabScroll } from "@/shared/lib/aiFabAway";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";

// /urgent — Tezkor advokat for the client: the blue block (header + hero, UrgentTop) stays put; under it only the services of the catalog
// and the "Mening so'rovlarim" row (the list: /urgent/requests) scroll.
// `tab`: the client's Tezkor tab — no back button, room at the bottom for the tab bar, and the floating AI button leaves while it scrolls down.
export default function UrgentPage({ tab }: { tab?: boolean } = {}) {
  const frame = useClientFrame();
  const insets = useInsets();
  const clearance = useTabClearance(24);
  const aiScroll = useAiFabScroll();
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: frame.ground ?? c.canvas }}>
      <UrgentTop noBack={tab} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tab ? clearance : insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        onScroll={tab ? aiScroll : undefined}
        scrollEventThrottle={16}
      >
        <ClientHeader />
      </ScrollView>
    </View>
  );
}

// The client's Tezkor tab (app/(tabs)/urgent).
export function UrgentTab() {
  return <UrgentPage tab />;
}
