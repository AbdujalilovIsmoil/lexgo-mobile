import { View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";

// Check-marked "included" lines and cross-marked "excluded" ones (cut with `max*` on cards, all in the sheet).
export function IncludeList({ included, excluded, maxIn, maxOut }: { included: string[]; excluded: string[]; maxIn?: number; maxOut?: number }) {
  const c = useColors();
  const row = (x: string, k: string, ok: boolean) => (
    <View key={k} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
      <Icon name={ok ? "check" : "x"} size={14} color={ok ? c.ok : c.gray2} />
      <Text variant="small" tone={ok ? "ink" : "gray2"} style={{ flex: 1 }}>{x}</Text>
    </View>
  );
  return (
    <View style={{ gap: 6 }}>
      {included.slice(0, maxIn).map((x, i) => row(x, `i${i}`, true))}
      {excluded.slice(0, maxOut).map((x, i) => row(x, `x${i}`, false))}
    </View>
  );
}
