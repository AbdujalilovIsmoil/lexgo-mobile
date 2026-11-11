import { ScrollView, View } from "react-native";
import { useClientFrame } from "@/widgets/client-dash";
import { ClientHeader, UrgentTop } from "@/widgets/urgent";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";

// /urgent — Tezkor advokat for the client: the blue block (header + hero, UrgentTop) stays put; under it only the services of the catalog
// and the "Mening so'rovlarim" row (the list: /urgent/requests) scroll.
export default function UrgentPage() {
  const frame = useClientFrame();
  const insets = useInsets();
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: frame.ground ?? c.canvas }}>
      <UrgentTop />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <ClientHeader />
      </ScrollView>
    </View>
  );
}
