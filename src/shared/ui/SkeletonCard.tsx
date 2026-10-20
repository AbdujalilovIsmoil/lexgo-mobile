import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Skeleton } from "./Skeleton";

// Generic card placeholder: icon block + a few text lines.
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <Skeleton width={56} height={56} round={18} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? "70%" : "92%"} height={i === 0 ? 18 : 12} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, borderRadius: radius.rl, borderWidth: 1, gap: 10 },
});
