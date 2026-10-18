import { View } from "react-native";
import { useColors } from "@/shared/theme";

export function Divider({ inset = 0, vertical = 0 }: { inset?: number; vertical?: number }) {
  const c = useColors();
  return <View style={{ height: 1, backgroundColor: c.line, marginLeft: inset, marginVertical: vertical }} />;
}
