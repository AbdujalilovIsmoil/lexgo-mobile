import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Card, Skeleton } from "@/shared/ui";

// Same silhouette as LawyerCard: avatar, name lines, pills, footer.
export function LawyerCardSkeleton({ compact }: { compact?: boolean }) {
  const c = useColors();
  const size = compact ? 48 : 56;
  return (
    <Card style={[s.card, compact && s.compact]}>
      <View style={s.top}>
        <Skeleton width={size} height={size} round={16} />
        <View style={s.info}>
          <Skeleton width="65%" height={18} />
          <Skeleton width="45%" height={12} />
          <Skeleton width="80%" height={14} />
        </View>
      </View>
      {compact ? null : (
        <View style={s.pills}>
          <Skeleton width={56} height={22} round={11} />
          <Skeleton width={120} height={22} round={11} />
        </View>
      )}
      <View style={[s.foot, { borderTopColor: c.line }]}>
        <Skeleton width={70} height={30} />
        <Skeleton width={96} height={30} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  compact: { width: 280 },
  top: { flexDirection: "row", gap: 12 },
  info: { flex: 1, gap: 8 },
  pills: { flexDirection: "row", gap: 6 },
  foot: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 12 },
});
