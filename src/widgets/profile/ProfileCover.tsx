import { StyleSheet, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { GradientBox, FocusStatusBar } from "@/shared/ui";

// The cover band of the profile header: the brand's dark gradient with two soft glows and thin rings.
export function ProfileCover() {
  const insets = useInsets();
  return (
    <GradientBox variant="dark" round={0} style={[s.cover, { height: insets.top + 118 }]}>
      <FocusStatusBar style="light" />
      <View style={s.glowA} pointerEvents="none" />
      <View style={s.glowB} pointerEvents="none" />
      <View style={s.ringA} pointerEvents="none" />
      <View style={s.ringB} pointerEvents="none" />
    </GradientBox>
  );
}

const s = StyleSheet.create({
  cover: { overflow: "hidden", borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  glowA: { position: "absolute", top: -90, right: -50, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(0,207,232,0.22)" },
  glowB: { position: "absolute", bottom: -110, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(22,104,240,0.4)" },
  ringA: { position: "absolute", top: 30, right: 36, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  ringB: { position: "absolute", top: 58, right: 64, width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
});
