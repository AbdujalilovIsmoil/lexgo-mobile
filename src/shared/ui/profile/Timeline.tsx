import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "../Text";

type Props = { color: string; title: string; subtitle?: string; meta?: string; time?: string; last?: boolean; children?: ReactNode };

// One step of a vertical timeline: coloured dot on a rail, text block, time on the right.
export function TimelineItem({ color, title, subtitle, meta, time, last, children }: Props) {
  const c = useColors();
  return (
    <View style={[s.row, !last && s.gap]}>
      <View style={s.rail}>
        <View style={[s.dot, { backgroundColor: color, borderColor: `${color}33` }]} />
        {!last ? <View style={[s.line, { backgroundColor: c.line }]} /> : null}
      </View>
      <View style={s.col}>
        <Text variant="small" weight="bold" numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="caption" tone="gray" numberOfLines={2}>{subtitle}</Text> : null}
        {meta ? <Text variant="caption" tone="gray2" numberOfLines={1}>{meta}</Text> : null}
        {children}
      </View>
      {time ? <Text variant="caption" tone="gray2">{time}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  gap: { paddingBottom: 16 },
  rail: { width: 14, alignItems: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 2 },
  line: { position: "absolute", top: 20, bottom: -2, width: 2, borderRadius: 1 },
  col: { flex: 1, gap: 2 },
});
