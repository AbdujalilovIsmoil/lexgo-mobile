import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LiquidGlass, PressableScale, useLiquidGlass } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { focused: boolean; onPress: () => void; labelKey: string };

const SIZE = 56;
const RING = 6;

// The AI destination in the middle of the bar: a deep navy disc with the sparkle in a ring, standing half above the bar. On iOS 26 both are
// SwiftUI Liquid Glass via Expo UI (a clear ring, a navy-tinted disc); elsewhere the ring takes the bar's own colour. No caption; the
// label is for the screen reader.
export function AiButton({ focused, onPress, labelKey }: Props) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const glass = useLiquidGlass();
  return (
    <View style={s.slot}>
      <PressableScale onPress={onPress} scale={0.92} style={[s.ring, !glass && { backgroundColor: dark ? c.surface : "#FFFFFF" }]} accessibilityRole="button" accessibilityLabel={t(labelKey)} accessibilityState={{ selected: focused }}>
        {glass ? (
          <>
            <LiquidGlass width={SIZE + RING * 2} height={SIZE + RING * 2} shape="circle" interactive />
            <View style={s.disc}>
              <LiquidGlass width={SIZE} height={SIZE} shape="circle" interactive scheme="dark" tint="rgba(16,36,92,0.92)" />
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            </View>
          </>
        ) : (
          <LinearGradient colors={["#2A4C9C", "#13275E", "#0A1638"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={s.disc}>
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          </LinearGradient>
        )}
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  slot: { flex: 1, alignItems: "center", minHeight: 56 },
  ring: {
    position: "absolute", top: -SIZE / 2 - RING, width: SIZE + RING * 2, height: SIZE + RING * 2, borderRadius: SIZE / 2 + RING, padding: RING,
    ...Platform.select({ ios: { shadowColor: "#0B1F45", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }, default: { elevation: 10 } }),
  },
  disc: { flex: 1, borderRadius: SIZE / 2, alignItems: "center", justifyContent: "center" },
});
