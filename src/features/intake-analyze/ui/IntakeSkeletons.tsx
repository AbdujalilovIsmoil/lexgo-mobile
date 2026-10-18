import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/shared/ui";

// Same silhouette as the MatchPicks hero: a heading and one tall card (tag + percentage, bar, monogram + lines, button).
export function MatchPicksSkeleton() {
  return (
    <View style={s.col}>
      <Skeleton width="62%" height={20} />
      <Skeleton height={248} round={20} />
    </View>
  );
}

// Same silhouette as SourceList: a heading, a lead line and the bordered source rows.
export function SourcesSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={s.sources}>
      <Skeleton width="55%" height={20} />
      <Skeleton width="85%" height={12} />
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} height={46} round={14} />)}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  sources: { gap: 8 },
});
