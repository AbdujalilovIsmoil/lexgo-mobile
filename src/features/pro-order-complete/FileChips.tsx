import { View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import type { Attached } from "./useResultFiles";

// The files picked for the result: name, spinner while uploading, remove.
export function FileChips({ items, onRemove }: { items: Attached[]; onRemove: (key: string) => void }) {
  const c = useColors();
  return (
    <View style={{ gap: 8 }}>
      {items.map((x) => (
        <View key={x.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: c.surface2 }}>
          <Icon name={x.busy ? "loader" : "paperclip"} size={16} tone="gray" />
          <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>{x.name}</Text>
          <PressableScale onPress={() => onRemove(x.key)} hitSlop={8}><Icon name="x" size={18} tone="gray" /></PressableScale>
        </View>
      ))}
    </View>
  );
}
