import { StyleSheet } from "react-native";
import { useColors } from "@/shared/theme";
import { Field } from "../admin/Field";
import { Icon, type IconName } from "../Icon";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

// The closed look of a picker: label, a box with an icon, the chosen value (or a grey "not set") and a chevron; a tap opens the sheet.
export function TriggerBox({ label, icon, text, empty, error, onPress }: { label?: string; icon: IconName; text: string; empty?: string; error?: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Field label={label} error={error}>
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label ?? ""} ${text || empty || ""}`} style={[s.box, { borderColor: error ? c.err : c.line, backgroundColor: c.surface }]}>
        <Icon name={icon} size={18} color={c.accent} />
        <Text variant="body" weight={text ? "semibold" : "regular"} tone={text ? "ink" : "gray2"} numberOfLines={1} style={s.text}>{text || empty}</Text>
        <Icon name="chevron-down" size={18} tone="gray" />
      </PressableScale>
    </Field>
  );
}

const s = StyleSheet.create({ box: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5 }, text: { flex: 1 } });
