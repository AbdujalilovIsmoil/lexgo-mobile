import { StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

// Icon + two lines: matches ListRow and notification rows.
export function ListRowSkeleton({ rows = 5, padded }: { rows?: number; padded?: boolean }) {
  return (
    <View style={[s.wrap, padded && s.padded]}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={s.row}>
          <Skeleton width={40} height={40} round={13} />
          <View style={s.col}>
            <Skeleton width={i % 2 ? "55%" : "70%"} height={15} />
            <Skeleton width="90%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 20 },
  padded: { paddingHorizontal: 16, paddingTop: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  col: { flex: 1, gap: 8 },
});
