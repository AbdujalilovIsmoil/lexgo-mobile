import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { OpenCase } from "@/entities/open-cases";

// One open case as a row of the cases card: title and the status chip on top, the case number (monospace chip) and the stage, then the
// next step in accent with an arrow. Rows are split by a hairline. A tap opens that case.
export function RequestRow({ c: row, last }: { c: OpenCase; last: boolean }) {
  const { t } = useT();
  const { colors: c, dark } = useTheme();
  const router = useRouter();
  const label = (v: string) => { const k = `cdash.st.${v}`; const x = t(k); return x === k ? v.replace(/[_-]+/g, " ").replace(/^\w/, (m) => m.toUpperCase()) : x; };
  const done = /done|closed|complete|resolved/.test(row.status);
  const busy = /progress|review|wait|pending/.test(row.status);
  const chip = done ? { bg: "#E3F5EA", fg: "#1F7A45" } : busy ? { bg: "#FDEBDD", fg: "#A3471A" } : { bg: c.tint2, fg: c.accent };
  const id = row.number || row.id;
  return (
    <PressableScale onPress={() => router.push(`/works/${encodeURIComponent(id)}` as never)} scale={0.99} accessibilityRole="button" style={[s.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark ? c.line : "#E6EBF3" }]}>
      <View style={s.top}>
        <Text variant="h4" numberOfLines={2} style={s.title}>{row.type || row.number}</Text>
        <View style={[s.chip, { backgroundColor: dark ? `${chip.fg}33` : chip.bg }]}><Text variant="caption" weight="bold" numberOfLines={1} style={{ color: dark ? c.ink : chip.fg }}>{label(row.status)}</Text></View>
      </View>
      <View style={s.meta}>
        {row.type && row.number ? <View style={[s.id, { backgroundColor: c.surface2 }]}><Text variant="caption" weight="bold" tone="gray" style={s.mono}>{row.number}</Text></View> : null}
        {row.stage ? <Text variant="small" tone="gray">{label(row.stage)}</Text> : null}
      </View>
      {row.nextAction ? (
        <View style={s.next}>
          <Icon name="arrow-right" size={16} tone="accent" />
          <Text variant="body" weight="bold" tone="accent" numberOfLines={2} style={s.flex}>{row.nextAction}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { flex: 1, fontSize: 16, lineHeight: 21 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, maxWidth: "60%" },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  id: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  next: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), letterSpacing: 0.3 },
});
