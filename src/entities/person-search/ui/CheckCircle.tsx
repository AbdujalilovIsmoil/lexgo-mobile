import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Icon } from "@/shared/ui";
import { useColors } from "@/shared/theme";

// Round selection mark: an empty ring, or a filled accent circle with a check once selected.
export function CheckCircle({ on, size = 26 }: { on: boolean; size?: number }) {
  const c = useColors();
  return (
    <View style={[s.ring, { width: size, height: size, borderRadius: size / 2, borderColor: on ? c.accent : c.gray2, backgroundColor: on ? c.accent : "transparent" }]}>
      {on ? <Animated.View entering={ZoomIn.duration(150)}><Icon name="check" size={Math.round(size * 0.62)} color="#FFFFFF" /></Animated.View> : null}
    </View>
  );
}

const s = StyleSheet.create({ ring: { borderWidth: 2, alignItems: "center", justifyContent: "center" } });
