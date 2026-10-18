import { StyleSheet, View } from "react-native";
import { Avatar, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import type { OrgNode } from "@/entities/admin-hrm";

// A person under a unit: a light one-line row (avatar, name, position) so big trees stay cheap to scroll.
export function OrgPersonRow({ node: n }: { node: OrgNode }) {
  const c = useColors();
  return (
    <View style={[s.row, { backgroundColor: c.surface2 }]}>
      <Avatar name={n.label} size={32} />
      <View style={s.fill}>
        <Text variant="small" weight="semibold" numberOfLines={1}>{n.label}</Text>
        {n.sub ? <Text variant="caption" tone="gray" numberOfLines={1}>{n.sub}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 }, fill: { flex: 1 } });
