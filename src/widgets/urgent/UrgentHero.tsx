import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, Skeleton, Text } from "@/shared/ui";
import { radius } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { UrgentCatalog } from "@/entities/urgent";

// Hero of the client page: the name of the module and what it is, then the three numbers every meeting runs on as one
// ruled strip (meeting / free extension / paid extension), all from the catalog.
export function UrgentHero({ cat, loading }: { cat?: UrgentCatalog; loading: boolean }) {
  const { t } = useT();
  const cols = cat ? [
    [t("ug1.metaMinutes"), t("ug4.minutesN", { n: cat.meetingMinutes })],
    [t("ug1.metaFree"), t("ug4.minutesN", { n: cat.freeExtensionMinutes })],
    ...(cat.paidExtensionPerMinute ? [[t("ug1.metaPaid"), t("ug1.perMinute", { price: fmtMoney(cat.paidExtensionPerMinute) })]] : []),
  ] : [];
  return (
    <LinearGradient colors={["#0B1B3F", "#0E2A63"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.box}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.bolt}><Icon name="zap" size={22} color="#FACC15" /></View>
      <Text variant="h2" tone="white">{cat?.title || t("ug1.title")}</Text>
      <Text variant="body" style={s.dim}>{t("ug1.lead")}</Text>
      {loading ? <Skeleton height={64} onDark /> : cols.length ? (
        <View style={s.strip}>
          {cols.map(([label, value], i) => (
            <View key={label} style={[s.col, i === 2 && { flex: 1.5 }, i > 0 && s.rule]}>
              <Text variant="small" weight="bold" tone="white">{value}</Text>
              <Text variant="caption" style={s.dim}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  box: { padding: 18, gap: 10, borderRadius: radius.rx, overflow: "hidden" },
  glow: { position: "absolute", right: -80, top: -90, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(22,104,240,0.35)" },
  bolt: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(250,204,21,0.16)" },
  dim: { color: "rgba(255,255,255,0.78)" },
  strip: { flexDirection: "row", marginTop: 6, paddingVertical: 12, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  col: { flex: 1, gap: 2, paddingHorizontal: 12 },
  rule: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.16)" },
});
