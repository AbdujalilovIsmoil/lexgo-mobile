import type { ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Text } from "@/shared/ui";

type Props = { label: string; right?: string; onLayout?: (e: LayoutChangeEvent) => void; children: ReactNode };

// A titled group of fields in the form: small caps-free label (optional note on the right) and a steady 10 pt rhythm.
export function FormSection({ label, right, onLayout, children }: Props) {
  return (
    <View style={s.sec} onLayout={onLayout}>
      <View style={s.head}>
        <Text variant="small" weight="semibold" tone="gray" style={s.label}>{label}</Text>
        {right ? <Text variant="caption" tone="gray2">{right}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  sec: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 4 },
  label: { letterSpacing: 0.4, textTransform: "uppercase" },
});
