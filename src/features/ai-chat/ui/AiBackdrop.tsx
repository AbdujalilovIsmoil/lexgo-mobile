import { StyleSheet, View } from "react-native";
import { useAiTheme } from "@/shared/theme";

// The AI screen's ground: the theme's flat colour (the greeting mark carries its own glow).
export function AiBackdrop() {
  const aiTheme = useAiTheme();
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: aiTheme.bg }]} pointerEvents="none" />;
}
