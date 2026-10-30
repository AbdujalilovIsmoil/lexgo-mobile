import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { UrgentCatalog } from "@/entities/urgent";

// Compact hero of the client page: eyebrow, the module's name and one line about it, then the three numbers every meeting runs on as
// three tiles (meeting / free extension / paid extension), all from the catalog.
export function UrgentHero({ cat, loading }: { cat?: UrgentCatalog; loading: boolean }) {
  const { t } = useT();
  const cols = cat ? [
    [t("ug4.minutesN", { n: cat.meetingMinutes }), t("ug1.metaMinutes")],
    [t("ug4.minutesN", { n: cat.freeExtensionMinutes }), t("ug1.metaFree")],
    ...(cat.paidExtensionPerMinute ? [[t("ug1.perMinute", { price: fmtMoney(cat.paidExtensionPerMinute) }), t("ug1.metaPaid")]] : []),
  ] : [];
  return (
    <LinearGradient colors={["#14295F", "#1D3D8F", "#2856B4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.box}>
      <Text variant="caption" weight="bold" style={s.eyebrow}>{t("ug1.page.eyebrow").toUpperCase()}</Text>
      <Text variant="h3" tone="white">{cat?.title || t("ug1.title")}</Text>
      <Text variant="small" style={s.dim}>{t("ug1.page.lead")}</Text>
      {loading ? <Skeleton height={54} onDark /> : cols.length ? (
        <View style={s.strip}>
          {cols.map(([value, label], i) => (
            <View key={label} style={[s.col, i > 0 && s.rule]}>
              <Text variant="small" weight="bold" tone="white" numberOfLines={2}>{value}</Text>
              <Text variant="caption" style={s.dim} numberOfLines={2}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 6, borderRadius: 20, overflow: "hidden" },
  eyebrow: { color: "rgba(255,255,255,0.75)", letterSpacing: 0.6 },
  dim: { color: "rgba(255,255,255,0.8)" },
  strip: { flexDirection: "row", marginTop: 6, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  col: { flex: 1, gap: 2, paddingHorizontal: 10, paddingVertical: 10 },
  rule: { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.14)" },
});
