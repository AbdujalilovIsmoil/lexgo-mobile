import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/shared/ui";

// Loading placeholder shaped like the result rows (round avatar + two text lines + checkbox).
export function PeopleSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <View>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={s.row}>
          <Skeleton width={48} height={48} round={24} />
          <View style={s.col}><Skeleton width={i % 2 ? "52%" : "68%"} height={14} /><Skeleton width="38%" height={11} /></View>
          <Skeleton width={26} height={26} round={13} />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 68, paddingHorizontal: 18 },
  col: { flex: 1, gap: 8 },
});
