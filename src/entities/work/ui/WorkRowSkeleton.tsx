import { View } from "react-native";
import { Skeleton } from "@/shared/ui";

// Placeholder rows while the first page of works loads.
export function WorkRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} height={132} round={20} />)}
    </View>
  );
}
