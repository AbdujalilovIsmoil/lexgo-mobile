import { View } from "react-native";
import { Skeleton } from "@/shared/ui";

// Placeholder shaped like the rows: a round tile on the rail, a title line and a shorter subtitle.
export function JournalSkeleton() {
  return (
    <View style={{ gap: 18, paddingTop: 8 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Skeleton width={40} height={40} round={20} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width={i % 2 ? "55%" : "70%"} height={14} />
            <Skeleton width={i % 2 ? "75%" : "45%"} height={12} />
          </View>
          <Skeleton width={36} height={12} />
        </View>
      ))}
    </View>
  );
}
