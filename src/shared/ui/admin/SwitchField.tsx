import { StyleSheet, View } from "react-native";
import { Text } from "../Text";
import { Toggle } from "../Toggle";

type Props = { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void };

// On/off row (active flag, "gift allowed" …).
export function SwitchField({ label, hint, value, onChange }: Props) {
  return (
    <View style={s.row}>
      <View style={s.col}>
        <Text variant="body" weight="semibold">{label}</Text>
        {hint ? <Text variant="caption" tone="gray">{hint}</Text> : null}
      </View>
      <Toggle value={value} onChange={onChange} label={label} />
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 12 }, col: { flex: 1, gap: 2 } });
