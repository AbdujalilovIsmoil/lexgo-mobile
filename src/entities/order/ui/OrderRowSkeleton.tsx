import { StyleSheet, View } from "react-native";
import { Card, Skeleton } from "@/shared/ui";

export function OrderRowSkeleton() {
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Skeleton width="60%" height={17} />
        <Skeleton width={70} height={22} round={11} />
      </View>
      <Skeleton width="40%" height={12} />
      <View style={s.head}>
        <Skeleton width="35%" height={11} />
        <Skeleton width={90} height={14} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
});
