import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";

// Placeholder with the card's own shape: tile + two title lines, client row, status/action row.
export function DocRowSkeleton() {
  const c = useColors();
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={s.row}><Skeleton width={44} height={44} round={radius.r} /><View style={s.col}><Skeleton height={14} /><Skeleton height={14} width="60%" /></View></View>
      <View style={s.row}><Skeleton width={24} height={24} round={12} /><Skeleton height={12} width="45%" /></View>
      <View style={s.row}><Skeleton width={84} height={22} round={11} /><View style={s.col} /><Skeleton width={110} height={36} round={18} /></View>
    </View>
  );
}

const s = StyleSheet.create({ card: { gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1 }, row: { flexDirection: "row", alignItems: "center", gap: 10 }, col: { flex: 1, gap: 8 } });
