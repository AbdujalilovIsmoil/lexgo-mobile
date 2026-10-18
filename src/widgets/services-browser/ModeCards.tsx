import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { MODES, type Mode } from "@/entities/service";

// Three equal gradient tiles in one row, so all three modes are always visible.
export function ModeCards({ onPick }: { onPick: (m: Mode) => void }) {
  const { t } = useT();
  return (
    <View style={s.row}>
      {MODES.map((m, i) => (
        <Animated.View key={m.key} entering={FadeInUp.delay(i * 80).duration(380)} style={s.cell}>
          <PressableScale onPress={() => onPick(m)} scale={0.96} style={s.press}>
            <LinearGradient colors={m.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
              <View style={s.mark}><Icon name={m.icon} size={70} color="rgba(255,255,255,0.18)" /></View>
              <View style={s.badge}><Icon name={m.icon} size={18} tone="white" /></View>
              <Text variant="small" weight="bold" tone="white" numberOfLines={2}>{t(m.titleKey)}</Text>
            </LinearGradient>
          </PressableScale>
        </Animated.View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingHorizontal: 16 },
  cell: { flex: 1 },
  press: { flex: 1 },
  card: { flex: 1, minHeight: 118, borderRadius: 20, padding: 12, justifyContent: "space-between", gap: 6, overflow: "hidden" },
  mark: { position: "absolute", right: -12, top: -12 },
  badge: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
});
