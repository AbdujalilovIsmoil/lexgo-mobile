import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";

type Tone = "info" | "warn" | "err" | "ok";

// A status message above the editor: tinted box, icon, title, text and an optional action.
export function Banner({ tone, icon, title, text, children }: { tone: Tone; icon: IconName; title: string; text?: string; children?: ReactNode }) {
  const c = useColors();
  const color = tone === "err" ? c.err : tone === "warn" ? c.warn : tone === "ok" ? c.ok : c.accent;
  const bg = tone === "err" ? c.errBg : tone === "warn" ? c.warnBg : tone === "ok" ? c.okBg : c.tint;
  return (
    <View style={[s.box, { backgroundColor: bg }]}>
      <Icon name={icon} size={20} color={color} />
      <View style={s.col}>
        <Text variant="small" weight="bold">{title}</Text>
        {text ? <Text variant="caption" tone="gray">{text}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const s = StyleSheet.create({ box: { flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.r }, col: { flex: 1, gap: 4, alignItems: "flex-start" } });
