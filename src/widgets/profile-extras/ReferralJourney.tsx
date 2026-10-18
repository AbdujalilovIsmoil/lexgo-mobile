import { StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/profile-extras";
import { Card, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pay/tOr";

// Progress to the discount as a row of steps: one dot per friend needed, a gift at the end.
export function ReferralJourney({ r }: { r: Referral }) {
  const { t } = useT();
  const c = useColors();
  const target = Math.max(r.eligibleAfter, 1);
  const pct = r.discountPercent || 5;
  const done = r.discountUnlocked ? target : Math.min(r.joined, target);
  return (
    <Card style={s.card}>
      <Text variant="h4">{t("py7.ref.discount")}</Text>
      <View style={s.track}>
        {Array.from({ length: target }, (_, i) => (
          <View key={i} style={s.cell}>
            <View style={[s.line, { backgroundColor: i < done ? c.accent : c.tint2 }]} />
            <View style={[s.dot, { backgroundColor: i < done ? c.accent : c.tint2 }]}>{i < done ? <Icon name="check" size={13} tone="white" /> : null}</View>
          </View>
        ))}
        <View style={[s.gift, { backgroundColor: r.discountUnlocked ? c.ok : c.tint2 }]}><Icon name="gift" size={16} color={r.discountUnlocked ? "#FFFFFF" : c.gray2} /></View>
      </View>
      <Text variant="small" tone="gray">{r.discountUnlocked ? t("py7.ref.discountOn", { pct }) : t("py7.ref.discountLeft", { n: r.remaining || target, pct })}</Text>
      {r.appliesTo.length ? <Text variant="caption" tone="gray2">{t("py7.ref.applies", { what: r.appliesTo.map((a) => tOr(t, "py7.ref.to", a)).join(", ") })}</Text> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 12 },
  track: { flexDirection: "row", alignItems: "center" },
  cell: { flex: 1, flexDirection: "row", alignItems: "center" },
  line: { flex: 1, height: 4, borderRadius: 2 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gift: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginLeft: 6 },
});
