import { View } from "react-native";
import { Skeleton } from "../Skeleton";
import { FieldCard } from "./FieldCard";

// Skeleton shaped like the list rows of a section: round mark + two text lines.
export function RowsSkeleton({ n = 2 }: { n?: number }) {
  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: n }, (_, i) => (
        <FieldCard key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Skeleton width={42} height={42} round={21} />
          <View style={{ flex: 1, gap: 8 }}><Skeleton width="60%" height={14} /><Skeleton width="40%" height={11} /></View>
        </FieldCard>
      ))}
    </View>
  );
}
