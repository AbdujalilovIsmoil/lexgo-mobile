import { View } from "react-native";
import { radius } from "@/shared/theme";
import { Skeleton } from "@/shared/ui";

// Loading placeholder shaped like the screen: status card, preset chips, seven day rows, deadline tiles.
export function AvailabilitySkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 14 }}>
      <Skeleton height={112} round={radius.rl} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[110, 90, 60, 84].map((w, i) => <Skeleton key={i} width={w} height={36} round={radius.pill} />)}
      </View>
      <View style={{ gap: 14, padding: 16, borderRadius: radius.rl }}>
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} height={i < 5 ? 84 : 44} round={radius.r} />)}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[0, 1, 2].map((i) => <Skeleton key={i} height={52} round={radius.r} style={{ flex: 1 }} />)}
      </View>
    </View>
  );
}
