import { View } from "react-native";
import { IconButton } from "@/shared/ui";

type Props = { index: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void };

// Move up / down / remove for a row of a list editor (replaces drag and drop).
export function RowTools({ index, count, onMove, onRemove }: Props) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {index > 0 ? <IconButton icon="arrow-up" size={34} onPress={() => onMove(-1)} /> : null}
      {index < count - 1 ? <IconButton icon="arrow-down" size={34} onPress={() => onMove(1)} /> : null}
      <IconButton icon="trash-2" size={34} onPress={onRemove} />
    </View>
  );
}
