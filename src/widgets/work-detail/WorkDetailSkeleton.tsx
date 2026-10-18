import { View } from "react-native";
import { Skeleton } from "@/shared/ui";

// Placeholder blocks while a work loads.
export function WorkDetailSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, gap: 12 }}>
      <Skeleton height={150} round={20} />
      <Skeleton height={110} round={20} />
      <Skeleton height={190} round={20} />
      <Skeleton height={140} round={20} />
    </View>
  );
}
