import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { RequestRow } from "./RequestRow";
import type { ActiveRow } from "./useActiveRequests";

const cardShadow = Platform.select({
  ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  default: { elevation: 1 },
});
// The glass theme's cards are see-through: a shadow would show through them as a dark block (Android elevation), so none there.
const noShadow = { elevation: 0, shadowOpacity: 0 };

// One card of "Faol so'rovlar" rows, split by hairlines.
export function RequestCard({ rows }: { rows: ActiveRow[] }) {
  const { colors: c, dark, glass } = useTheme();
  return (
    <View style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#E6EBF3" }, glass && noShadow]}>
      {rows.map((x, i) => <RequestRow key={x.key} row={x.row} last={i === rows.length - 1} />)}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, ...cardShadow },
});
