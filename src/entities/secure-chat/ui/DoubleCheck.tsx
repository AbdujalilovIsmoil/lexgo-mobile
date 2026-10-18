import { View } from "react-native";
import { Icon } from "@/shared/ui";

// The web's double tick (IconCheckDouble): two checks, the second pushed right and down, drawn over each other.
export function DoubleCheck({ color, size = 12 }: { color: string; size?: number }) {
  const off = Math.round(size * 0.38);
  return (
    <View style={{ width: size + off, height: size }}>
      <View style={{ position: "absolute", left: 0 }}><Icon name="check" size={size} color={color} /></View>
      <View style={{ position: "absolute", left: off }}><Icon name="check" size={size} color={color} /></View>
    </View>
  );
}
