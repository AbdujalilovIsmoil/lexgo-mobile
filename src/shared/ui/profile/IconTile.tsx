import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, type IconName } from "../Icon";
import { ACCENTS, type Accent } from "./accents";

// Rounded gradient tile with a white line icon (the leading mark of a profile section / sheet).
export function IconTile({ accent, icon, size = 40 }: { accent: Accent; icon: IconName; size?: number }) {
  return (
    <LinearGradient colors={[...ACCENTS[accent]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: "center", justifyContent: "center" }}>
      <View><Icon name={icon} size={size * 0.5} color="#FFFFFF" /></View>
    </LinearGradient>
  );
}
