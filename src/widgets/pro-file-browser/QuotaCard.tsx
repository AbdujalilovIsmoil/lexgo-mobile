import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cardTone, usageByKind, type Tree } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { fmtBytes } from "@/shared/lib/pro/bytes";
import { gradient, radius } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";

// Storage as a dark card: the used amount large, one bar split by what fills it (PDF, documents, tables, images, other) with a
// legend, and what is left. The bar turns red near the cap; the totals come from the server's quota, never a fixed limit.
export function QuotaCard({ tree }: { tree: Tree }) {
  const { t } = useT();
  const q = tree.quota;
  const total = q.quotaBytes || q.limitGb * 1024 ** 3;
  const used = total ? Math.min(1, q.usedBytes / total) : 0;
  const parts = usageByKind(tree.files);
  const hot = used > 0.9;
  return (
    <LinearGradient colors={hot ? ["#7A1D1D", "#B42318"] : [...gradient.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.ring} pointerEvents="none" />
      <View style={s.top}>
        <View style={s.ico}><Icon name="hard-drive" size={16} tone="white" /></View>
        <Text variant="small" weight="bold" tone="white" style={s.flex}>{t("aw8.storage")}</Text>
        <View style={s.pct}><Text variant="caption" weight="bold" tone="white">{Math.round(used * 100)}%</Text></View>
      </View>
      <Text variant="hx" tone="white">{fmtBytes(q.usedBytes) || "0 B"}<Text variant="body" style={s.soft}>  / {fmtBytes(total)}</Text></Text>
      <View style={s.bar}>{parts.map((p) => <View key={p.kind} style={{ width: `${Math.max(1.5, (p.bytes / total) * 100)}%`, backgroundColor: cardTone(p.kind).front2 }} />)}</View>
      <View style={s.legend}>
        {parts.map((p) => <View key={p.kind} style={s.item}><View style={[s.dot, { backgroundColor: cardTone(p.kind).front2 }]} /><Text variant="caption" style={s.soft}>{t(`aw8.type.${p.kind}`)} · {fmtBytes(p.bytes)}</Text></View>)}
      </View>
      <View style={s.foot}>
        <Text variant="caption" style={s.soft}>{t("aw8.free", { size: fmtBytes(Math.max(0, total - q.usedBytes)) || "0 B" })}</Text>
        <Text variant="caption" style={s.soft}>{t("aw8.counts", { f: tree.folders.length, n: tree.files.length })}</Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: radius.rl, overflow: "hidden" },
  ring: { position: "absolute", width: 170, height: 170, borderRadius: 85, borderWidth: 20, borderColor: "rgba(255,255,255,0.07)", right: -50, top: -60 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  ico: { width: 30, height: 30, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  pct: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)" },
  flex: { flex: 1 },
  soft: { color: "rgba(255,255,255,0.78)" },
  bar: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 2, backgroundColor: "rgba(255,255,255,0.14)" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  foot: { flexDirection: "row", justifyContent: "space-between" },
});
