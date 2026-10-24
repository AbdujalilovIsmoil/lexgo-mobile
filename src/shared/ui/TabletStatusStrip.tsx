import { StyleSheet, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useTabletStatus } from "@/shared/lib/useTablet";
import { useColors } from "@/shared/theme";

// A tablet's status bar sits on the theme's own colour across the whole width (see useTabletStatus): its icons then read in both themes.
export function TabletStatusStrip() {
  const c = useColors();
  const insets = useInsets();
  const on = useTabletStatus();
  if (!on || insets.top <= 0) return null;
  return <View pointerEvents="none" style={[s.strip, { height: insets.top, backgroundColor: c.bg }]} />;
}

const s = StyleSheet.create({ strip: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 } });
