import { StyleSheet, View } from "react-native";
import { Card, Skeleton } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";

// The profile's silhouette while it loads — the same layout: back and share, the monogram, name and lines,
// the tab bar and one section card.
export function SpecialistSkeleton() {
  const c = useColors();
  const insets = useInsets();
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <View style={{ height: insets.top + 330, backgroundColor: "#0B1A33", justifyContent: "flex-end", padding: 18, gap: 10 }}><Skeleton width={110} height={22} round={11} onDark /><Skeleton width={220} height={30} onDark /><Skeleton width={160} height={16} onDark /></View>
      <View style={s.id}>
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
  id: { paddingHorizontal: 18, marginTop: 12, gap: 8 },
  gap: { marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  half: { flex: 1 },
  body: { paddingHorizontal: 16, marginTop: 20, gap: 14 },
  card: { gap: 14 },
});
