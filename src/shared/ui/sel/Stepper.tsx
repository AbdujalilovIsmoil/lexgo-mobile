import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon } from "../Icon";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

type Props = { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; suffix?: string };

// − value + control for small whole numbers (minutes, years …).
export function Stepper({ label, value, onChange, min = 0, max = 999, step = 1, suffix }: Props) {
  const c = useColors();
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn = (name: "minus" | "plus", d: number, off: boolean) => (
    <PressableScale onPress={() => set(value + d)} disabled={off} style={[s.btn, { backgroundColor: c.surface2, opacity: off ? 0.4 : 1 }]} accessibilityLabel={name}>
      <Icon name={name} size={18} tone="accent" />
    </PressableScale>
  );
  return (
    <View style={s.row}>
      <Text variant="small" tone="gray" style={s.label}>{label}</Text>
      {btn("minus", -step, value <= min)}
      <Text variant="body" weight="bold" style={s.value}>{value}{suffix ? ` ${suffix}` : ""}</Text>
      {btn("plus", step, value >= max)}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { flex: 1 },
  btn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  value: { minWidth: 64, textAlign: "center" },
});
