import { StyleSheet, View } from "react-native";
import { DirectionTile, useServiceCategories, type ServiceCategory } from "@/entities/service";
import { ErrorView, Skeleton } from "@/shared/ui";

// 2-column grid of directions with equal-height tiles; skeletons while loading.
export function DirectionGrid({ onPick }: { onPick: (c: ServiceCategory) => void }) {
  const { data, error, refetch } = useServiceCategories();
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} compact />;
  if (!data) return <View style={s.grid}>{[0, 1].map((r) => <View key={r} style={s.row}><Skeleton height={138} round={22} style={s.cell} /><Skeleton height={138} round={22} style={s.cell} /></View>)}</View>;
  const rows = Array.from({ length: Math.ceil(data.length / 2) }, (_, r) => data.slice(r * 2, r * 2 + 2));
  return (
    <View style={s.grid}>
      {rows.map((row, r) => (
        <View key={r} style={s.row}>
          {row.map((c, i) => <DirectionTile key={c.id} category={c} index={r * 2 + i} onPress={() => onPick(c)} />)}
          {row.length === 1 ? <View style={s.cell} /> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { gap: 12, paddingHorizontal: 16 },
  row: { flexDirection: "row", gap: 12 },
  cell: { flex: 1 },
});
