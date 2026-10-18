import { StyleSheet, View } from "react-native";
import { useBadge } from "@/shared/lib";
import { Text } from "@/shared/ui";

// Red counter on a tab icon (99+ capped); renders nothing at zero.
export function TabBadge({ id }: { id?: string }) {
  const n = useBadge(id);
  if (!n) return null;
  return (
    <View style={s.badge}>
      <Text variant="caption" tone="white" weight="bold" style={s.text}>{n > 99 ? "99+" : n}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { position: "absolute", top: -5, right: -10, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  text: { fontSize: 9.5, lineHeight: 12 },
});
