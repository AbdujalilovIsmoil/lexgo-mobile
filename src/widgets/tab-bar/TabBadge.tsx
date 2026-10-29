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
  badge: { position: "absolute", top: -7, right: -12, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: "#E53935", borderWidth: 2, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  text: { fontSize: 10.5, lineHeight: 13 },
});
