import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fmtUzs, groupOf, type PayGroup, type PaymentRow } from "@/entities/payment";
import { brand, radius, shadows } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// What the filters show, as a wallet card: money actually paid (big) and three tappable counters that jump to that
// status (all, waiting — warm when something needs attention — refunded).
export function PaymentWallet({ rows, onGroup }: { rows: PaymentRow[]; onGroup: (g: PayGroup) => void }) {
  const { t } = useT();
  const paid = rows.filter((p) => groupOf(p.status) === "paid").reduce((n, p) => n + p.amount, 0);
  const waiting = rows.filter((p) => groupOf(p.status) === "pending").length;
  const refunded = rows.filter((p) => groupOf(p.status) === "refunded").length;
  const stats: [string, number, PayGroup, string][] = [["layers", rows.length, "all", t("pyx.count")], ["clock", waiting, "pending", t("pyx.waiting")], ["rotate-ccw", refunded, "refunded", t("pyx.refunded")]];
  return (
    <LinearGradient colors={[brand.b800, brand.b600, "#0E9FD0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, shadows.blue]}>
      <Text variant="small" tone="white" style={s.soft}>{t("pyx.total")}</Text>
      <Text variant="hx" tone="white">{fmtUzs(paid, t)}</Text>
      <View style={s.row}>
        {stats.map(([icon, n, g, label]) => (
          <PressableScale key={g} onPress={() => onGroup(g)} accessibilityRole="button" style={[s.stat, g === "pending" && n > 0 ? s.warm : null]}>
            <Icon name={icon as never} size={15} color={g === "pending" && n > 0 ? "#FFD36B" : "#FFFFFF"} />
            <Text variant="body" weight="bold" tone="white">{n}</Text>
            <Text variant="caption" tone="white" numberOfLines={1} style={s.soft}>{label}</Text>
          </PressableScale>
        ))}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, borderRadius: radius.rl, gap: 6, marginBottom: 14, overflow: "hidden" },
  soft: { opacity: 0.85 },
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  stat: { flex: 1, gap: 2, padding: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)" },
  warm: { backgroundColor: "rgba(255,190,60,0.28)" },
});
