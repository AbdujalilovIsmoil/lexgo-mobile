import { View } from "react-native";
import { Skeleton } from "@/shared/ui";

export function LawyerSheetSkeleton() {
  return (
    <View style={{ paddingHorizontal: 18, gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <Skeleton width={68} height={68} round={20} />
        <View style={{ flex: 1, gap: 8 }}><Skeleton width="70%" height={20} /><Skeleton width="45%" height={13} /></View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={78} round={18} style={{ flex: 1 }} />)}</View>
      <Skeleton height={44} round={22} />
      <Skeleton height={14} /><Skeleton width="90%" height={14} /><Skeleton width="70%" height={14} />
    </View>
  );
}
