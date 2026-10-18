import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/shared/ui";

// Loading placeholder shaped like the agenda: the time on the rail and a meeting card per row.
export function MeetingsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View style={s.wrap}>
      <Skeleton width={90} height={16} />
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={s.row}>
          <Skeleton width={40} height={14} style={s.time} />
          <Skeleton height={92} round={20} style={s.card} />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10, paddingTop: 8 },
  row: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  time: { marginTop: 12, marginLeft: 3 },
  card: { flex: 1 },
});
