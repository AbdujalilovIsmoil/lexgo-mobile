import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatSheet } from "@/widgets/stat-sheets";
import { STATS } from "./statsData";
import { StatTile } from "./StatTile";
import { useHomeStats } from "@/features/home-stats";

// Bento grid of platform numbers (2 + 1 tiles). Each tile opens a drawer
// with the real data behind the number.
export function StatsRow() {
  const [open, setOpen] = useState<string | null>(null);
  const live = useHomeStats();
  const value: Record<string, number> = { lawyers: live.lawyers, templates: live.services, coverage: live.regions };
  const rows = [STATS.slice(0, 2), STATS.slice(2)];
  return (
    <View style={s.grid}>
      {rows.map((row, r) => (
        <View key={r} style={s.row}>
          {row.map((item, i) => (
            <StatTile key={item.key} item={{ ...item, value: value[item.key] ?? 0 }} index={r * 2 + i} onPress={() => setOpen(item.key)} />
          ))}
        </View>
      ))}
      <StatSheet statKey={open} onClose={() => setOpen(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  grid: { marginHorizontal: 16, marginTop: 20, gap: 12 },
  row: { flexDirection: "row", gap: 12 },
});
