import { StyleSheet, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { RequestRow } from "./RequestRow";
import { cardShadow, noShadow } from "./DashTiles";
import type { ActiveRow } from "./useActiveRequests";

// One card of "Faol so'rovlar" rows, split by hairlines.
export function RequestCard({ rows }: { rows: ActiveRow[] }) {
  const { colors: c, dark, glass } = useTheme();
  return (
    <View style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }, glass && noShadow]}>
      {rows.map((x, i) => <RequestRow key={x.key} row={x.row} last={i === rows.length - 1} />)}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, ...cardShadow },
});
