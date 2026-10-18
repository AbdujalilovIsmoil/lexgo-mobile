import { useState } from "react";
import { StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useColors } from "@/shared/theme";
import { successHaptic } from "@/shared/lib/haptics";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The public id as a chip: one tap copies it (CASE-XXXXX is what the client quotes to support).
export function CopyId({ value }: { value: string }) {
  const c = useColors();
  const { t } = useT();
  const [done, setDone] = useState(false);
  const copy = () => {
    void Clipboard.setStringAsync(value);
    successHaptic();
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };
  return (
    <PressableScale onPress={copy} haptic={false} accessibilityRole="button" accessibilityLabel={t("ntd.wdCopy")} style={[s.chip, { backgroundColor: c.surface2, borderColor: c.line }]}>
      <Text variant="small" weight="bold">{value}</Text>
      <Icon name={done ? "check" : "copy"} size={14} color={done ? c.ok : c.gray} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
});
