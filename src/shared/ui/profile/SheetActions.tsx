import { ActivityIndicator, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient, useColors } from "@/shared/theme";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

type Props = { cancel: { label: string; onPress: () => void }; submit: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean } };

const H = 52;

// The Cancel / Save pair of a sheet. Both halves are built the same way (one 52 pt pill: fill, 1.5 px edge, centred
// label), side by side with equal width, so they can never differ in height, width or label position.
export function SheetActions({ cancel, submit }: Props) {
  const c = useColors();
  const off = submit.disabled || submit.loading;
  return (
    <View style={s.row}>
      <PressableScale onPress={cancel.onPress} style={[s.pill, s.half, { backgroundColor: c.glassFill, borderColor: c.glassLine }]} accessibilityRole="button">
        <Text variant="body" weight="semibold">{cancel.label}</Text>
      </PressableScale>
      <PressableScale onPress={submit.onPress} disabled={off} style={[s.pill, s.half, s.save, off && s.off]} accessibilityRole="button">
        <LinearGradient colors={[...gradient.primary]} locations={[...gradient.primaryStops]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {submit.loading ? <ActivityIndicator color="#FFFFFF" /> : <Text variant="body" weight="semibold" tone="white">{submit.label}</Text>}
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  pill: { height: H, borderRadius: H / 2, borderWidth: 1.5, borderColor: "transparent", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  save: { borderWidth: 0 },
  off: { opacity: 0.55 },
});
