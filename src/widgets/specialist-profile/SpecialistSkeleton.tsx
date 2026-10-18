import { StyleSheet, View } from "react-native";
import { Card, GradientBox, Header, Skeleton } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";

// The profile's silhouette while it loads — the same layout: dark cover, avatar on its edge, name and chips,
// the tab bar and one section card.
export function SpecialistSkeleton() {
  const c = useColors();
  const insets = useInsets();
  return (
    <View style={[s.fill, { backgroundColor: c.bg }]}>
      <GradientBox variant="dark" round={0} style={[s.cover, { height: insets.top + 118 }]}><Header transparent light /></GradientBox>
      <View style={s.id}>
        <View style={[s.ring, { backgroundColor: c.bg }]}><Skeleton width={92} height={92} round={46} /></View>
        <Skeleton width={190} height={26} style={s.gap} />
        <Skeleton width={130} height={14} />
        <Skeleton width={160} height={14} />
        <View style={s.row}><Skeleton width={78} height={22} round={11} /><Skeleton width={96} height={22} round={11} /></View>
      </View>
      <View style={s.body}>
        <Skeleton height={64} round={22} />
        <Card style={s.card}>
          <View style={s.row}><Skeleton width={44} height={44} round={14} /><Skeleton width={140} height={20} /></View>
          <View style={s.row}><Skeleton height={64} round={16} style={s.half} /><Skeleton height={64} round={16} style={s.half} /></View>
          <Skeleton height={14} /><Skeleton width="86%" height={14} /><Skeleton width="64%" height={14} />
        </Card>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  cover: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  id: { paddingHorizontal: 20, marginTop: -46, gap: 8 },
  ring: { alignSelf: "flex-start", padding: 5, borderRadius: 56 },
  gap: { marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  half: { flex: 1 },
  body: { paddingHorizontal: 16, marginTop: 20, gap: 14 },
  card: { gap: 14 },
});
