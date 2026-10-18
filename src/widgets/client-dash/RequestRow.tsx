import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { OpenCase } from "@/entities/open-cases";

// .creq: status dot, title, "stage · CASE-NO", the next action and the status badge. A tap opens that very case.
export function RequestRow({ c: row, last }: { c: OpenCase; last: boolean }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const label = (v: string) => { const k = `cdash.st.${v}`; const x = t(k); return x === k ? v.replace(/[_-]+/g, " ").replace(/^\w/, (m) => m.toUpperCase()) : x; };
  const tone = /done|closed|complete|resolved/.test(row.status) ? c.ok : /progress|review|wait|pending/.test(row.status) ? c.warn : c.accent;
  const id = row.number || row.id;
  return (
    <PressableScale onPress={() => router.push(`/works/${encodeURIComponent(id)}` as never)} accessibilityRole="button" style={[s.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
      <View style={[s.dot, { backgroundColor: tone }]} />
      <View style={s.main}>
        <Text variant="body" weight="bold" numberOfLines={2}>{row.type || row.number}</Text>
        <View style={s.meta}>
          {row.type && row.number ? <View style={[s.id, { backgroundColor: c.tint2 }]}><Text variant="caption" weight="bold" tone="accent">{row.number}</Text></View> : null}
          {row.stage ? <Text variant="small" tone="gray">{label(row.stage)}</Text> : null}
        </View>
        {row.nextAction ? <View style={s.next}><Icon name="arrow-right" size={14} tone="accent" /><Text variant="small" weight="semibold" tone="accent" style={s.flex}>{row.nextAction}</Text></View> : null}
      </View>
      <View style={s.side}>
        <View style={[s.badge, { backgroundColor: `${tone}26` }]}><Text variant="caption" weight="bold" style={{ color: tone }}>{label(row.status)}</Text></View>
        <Icon name="chevron-right" size={18} tone="gray" />
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, paddingVertical: 14, alignItems: "flex-start" },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  main: { flex: 1, minWidth: 0, gap: 5 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  id: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  next: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
  side: { alignItems: "flex-end", gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
});
