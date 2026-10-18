import { StyleSheet, View } from "react-native";
import { Card, Skeleton } from "@/shared/ui";

// Placeholder shaped like the screen: hero (ring + lines), timeline (nodes + cards), a list block.
export function OnboardingSkeleton() {
  return (
    <View style={s.page}>
      <Card style={s.hero}>
        <Skeleton width={96} height={96} round={48} />
        <View style={s.lines}>
          <Skeleton width={70} height={20} round={10} />
          <Skeleton width="85%" height={22} />
          <Skeleton width="100%" height={14} />
        </View>
      </Card>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={s.step}>
          <Skeleton width={32} height={32} round={16} />
          <Skeleton height={64} round={14} style={s.flex} />
        </View>
      ))}
      <Skeleton height={180} round={20} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  hero: { flexDirection: "row", alignItems: "center", gap: 16 },
  lines: { flex: 1, gap: 8 },
  step: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
});
