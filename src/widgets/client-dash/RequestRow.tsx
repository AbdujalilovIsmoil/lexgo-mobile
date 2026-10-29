import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { OpenCase } from "@/entities/open-cases";
import { cardShadow } from "./DashTiles";

// One open case as a card: title and the status chip on top, then the case number (monospace chip) and the stage. A tap opens that case.
export function RequestRow({ c: row }: { c: OpenCase }) {
  const { t } = useT();
  const { colors: c, dark } = useTheme();
  const router = useRouter();
  const label = (v: string) => { const k = `cdash.st.${v}`; const x = t(k); return x === k ? v.replace(/[_-]+/g, " ").replace(/^\w/, (m) => m.toUpperCase()) : x; };
  const done = /done|closed|complete|resolved/.test(row.status);
  const busy = /progress|review|wait|pending/.test(row.status);
  const chip = done ? { bg: "#E3F5EA", fg: "#1F7A45" } : busy ? { bg: "#FDEBDD", fg: "#A3471A" } : { bg: c.tint2, fg: c.accent };
  const id = row.number || row.id;
  return (
    <PressableScale onPress={() => router.push(`/works/${encodeURIComponent(id)}` as never)} scale={0.98} accessibilityRole="button" style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }]}>
      <View style={s.top}>
        <Text variant="h4" numberOfLines={2} style={s.title}>{row.type || row.number}</Text>
        <View style={[s.chip, { backgroundColor: dark ? `${chip.fg}33` : chip.bg }]}><Text variant="caption" weight="bold" numberOfLines={1} style={{ color: dark ? c.ink : chip.fg }}>{label(row.status)}</Text></View>
      </View>
      <View style={s.meta}>
        {row.type && row.number ? <View style={[s.id, { backgroundColor: c.surface2 }]}><Text variant="caption" weight="bold" tone="gray" style={s.mono}>{row.number}</Text></View> : null}
        {row.stage ? <Text variant="small" tone="gray">{label(row.stage)}</Text> : null}
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 8, ...cardShadow },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { flex: 1, fontSize: 16, lineHeight: 21 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, maxWidth: "60%" },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  id: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), letterSpacing: 0.3 },
});
