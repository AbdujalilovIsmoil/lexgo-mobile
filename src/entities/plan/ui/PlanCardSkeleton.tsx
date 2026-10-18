import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Card, Skeleton } from "@/shared/ui";

export function PlanCardSkeleton() {
  const c = useColors();
  return (
    <Card style={s.card}>
      <Skeleton width="40%" height={22} />
      <Skeleton width="85%" height={12} />
      <Skeleton width="55%" height={34} style={s.price} />
      <View style={[s.features, { borderTopColor: c.line }]}>
        {[92, 78, 86, 70].map((w, i) => (
          <View key={i} style={s.feature}>
            <Skeleton width={20} height={20} round={10} />
            <Skeleton width={`${w}%`} height={12} />
          </View>
        ))}
      </View>
      <Skeleton height={50} round={25} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 20 },
  price: { marginTop: 4 },
  features: { borderTopWidth: 1, paddingTop: 14, gap: 12, marginVertical: 6 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
});
