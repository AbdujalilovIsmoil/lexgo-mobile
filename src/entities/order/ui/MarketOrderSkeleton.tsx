import { StyleSheet, View } from "react-native";
import { Card, Skeleton } from "@/shared/ui";

export function MarketOrderSkeleton() {
  return (
    <Card style={s.card}>
      <View style={s.row}><Skeleton width={90} height={12} /><Skeleton width={96} height={22} round={11} /></View>
      <Skeleton width="70%" height={18} />
      <Skeleton height={5} round={3} />
      <View style={s.row}><Skeleton width="45%" height={11} /><Skeleton width={90} height={14} /></View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
});
