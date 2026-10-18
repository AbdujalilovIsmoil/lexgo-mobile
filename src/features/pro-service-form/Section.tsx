import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";

type Props = { icon: IconName; label: string; right?: string; muted?: boolean; children: ReactNode };

// One block of the form: small icon tile + label (+ a counter on the right), then its controls. `muted` = not applicable yet.
export function Section({ icon, label, right, muted, children }: Props) {
  const c = useColors();
  return (
    <View style={s.col}>
      <View style={s.head}>
        <View style={[s.tile, { backgroundColor: c.tint2 }]}><Icon name={icon} size={16} tone="accent" /></View>
        <Text variant="body" weight="bold" style={s.label} tone={muted ? "gray" : "ink"} accessibilityRole="header">{label}</Text>
        {right ? <Text variant="caption" tone="gray" accessibilityLabel={right}>{right}</Text> : null}
      </View>
      <View style={[s.body, muted && s.muted]}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 32 },
  tile: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
  body: { gap: 8 },
  muted: { opacity: 0.55 },
});
