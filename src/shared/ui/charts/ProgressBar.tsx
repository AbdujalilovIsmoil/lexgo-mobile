import { View } from "react-native";
import { useColors } from "@/shared/theme";

// 0..1 progress (quota used, step done …).
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const c = useColors();
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surface2, overflow: "hidden" }}>
      <View style={{ height: 8, borderRadius: 4, width: `${Math.min(Math.max(value, 0), 1) * 100}%`, backgroundColor: color ?? c.accent }} />
    </View>
  );
}
