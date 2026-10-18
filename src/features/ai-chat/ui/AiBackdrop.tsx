import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { aiTheme } from "@/shared/theme";

// Deep-navy gradient with two soft glows behind the AI screen.
export function AiBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...aiTheme.bg]} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[s.glow, s.top]} />
      <View style={[s.glow, s.bottom]} />
    </View>
  );
}

const s = StyleSheet.create({
  glow: { position: "absolute", width: 340, height: 340, borderRadius: 170 },
  top: { top: -140, right: -120, backgroundColor: "rgba(0,207,232,0.14)" },
  bottom: { bottom: -160, left: -140, backgroundColor: "rgba(22,104,240,0.22)" },
});
