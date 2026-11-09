import { Platform, StyleSheet, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";

export type ChipTone = "done" | "busy" | "open";
export type ActiveRowData = { title: string; status: string; tone: ChipTone; id?: string; stage?: string; next?: string; onPress: () => void };

// One row of the "Faol so'rovlar" card (an urgent request or an open case): title and the status chip on top, the number (monospace chip)
// and the stage, then the next step in accent with an arrow. Rows are split by a hairline. A tap opens it.
export function RequestRow({ row, last }: { row: ActiveRowData; last: boolean }) {
  const { colors: c, dark } = useTheme();
  const chip = row.tone === "done" ? { bg: "#E3F5EA", fg: "#1F7A45" } : row.tone === "busy" ? { bg: "#FDEBDD", fg: "#A3471A" } : { bg: c.tint2, fg: c.accent };
  return (
    <PressableScale onPress={row.onPress} scale={0.99} accessibilityRole="button" style={[s.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark ? c.line : "#E6EBF3" }]}>
      <View style={s.top}>
        <Text variant="h4" weight="semibold" numberOfLines={2} maxFontSizeMultiplier={1.15} style={s.title}>{row.title}</Text>
        <View style={[s.chip, { backgroundColor: dark ? `${chip.fg}33` : chip.bg }]}><Text variant="caption" weight="bold" numberOfLines={1} style={{ color: dark ? c.ink : chip.fg }}>{row.status}</Text></View>
      </View>
      {row.id || row.stage ? (
        <View style={s.meta}>
          {row.id ? <View style={[s.id, { backgroundColor: c.surface2 }]}><Text variant="caption" weight="bold" tone="gray" style={s.mono}>{row.id}</Text></View> : null}
          {row.stage ? <Text variant="caption" weight="regular" tone="gray" maxFontSizeMultiplier={1.15} style={s.stage}>{row.stage}</Text> : null}
        </View>
      ) : null}
      {row.next ? (
        <View style={s.next}>
          <ArrowRight size={16} color={c.accent} />
          <Text variant="h4" weight="semibold" tone="accent" numberOfLines={2} maxFontSizeMultiplier={1.15} style={[s.flex, s.title]}>{row.next}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { flex: 1, fontSize: 14, lineHeight: 18 },
  stage: { fontSize: 12, lineHeight: 14 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, maxWidth: "60%" },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  id: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  next: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), letterSpacing: 0.3 },
});
