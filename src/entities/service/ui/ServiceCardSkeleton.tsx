import { StyleSheet, View } from "react-native";
import { Card, Skeleton } from "@/shared/ui";

export function ServiceCardSkeleton() {
  return (
    <Card style={s.card}>
      <Skeleton width={40} height={40} round={20} />
      <View style={s.col}>
        <Skeleton width="92%" height={15} />
        <Skeleton width="60%" height={15} />
        <View style={s.meta}><Skeleton width="38%" height={11} /><Skeleton width={84} height={22} round={11} /></View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  col: { flex: 1, gap: 8 },
  meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
