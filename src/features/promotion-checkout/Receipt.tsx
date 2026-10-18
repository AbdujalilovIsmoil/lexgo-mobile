import { StyleSheet, View } from "react-native";
import type { Placement, PromoPackage } from "@/entities/promotion";
import { radius, useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { Notice } from "@/shared/ui/sel";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

const KEY = { banner: "Banner", profile_boost: "Profile", service_boost: "Service" } as const;
const LEADER = ". ".repeat(200);

// The leader fills the gap between label and value on the row's baseline: a long dotted string, one line, clipped by its box
// (a fixed-width Text inside an overflow-hidden flex box, so it never wraps, ellipsizes or pushes the value out).
function Leader() {
  const c = useColors();
  return (
    <View style={s.leaderBox} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text variant="small" numberOfLines={1} ellipsizeMode="clip" style={[s.dots, { color: c.gray2 }]}>{LEADER}</Text>
    </View>
  );
}

type Props = { pkg: PromoPackage; placement: Placement; target: string };

// Receipt-style summary: label ···· value rows with dotted leaders, a bold total at the foot and the payment note under it.
// The price is the server's — the client sends only ids.
export function Receipt({ pkg, placement, target }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const rows: [string, string][] = [
    [t("promoSeller.ck.placementTitle"), t(`promoSeller.placement${KEY[placement]}`)],
    [t(placement === "service_boost" ? "promoSeller.ck.service" : "promoSeller.ck.seller"), target],
    [t("promoSeller.ck.package"), pkg.title],
    [t("promoSeller.ck.duration"), t("promoSeller.ck.days", { d: pkg.days })],
  ];
  return (
    <SectionCard title={t("promoSeller.ck.receipt")}>
      <View style={[s.paper, { backgroundColor: c.surface2 }]}>
        {rows.map(([label, value]) => (
          <View key={label} accessible accessibilityLabel={`${label}: ${value}`} style={s.row}>
            <Text variant="small" tone="gray" style={s.label} numberOfLines={2}>{label}</Text>
            <Leader />
            <Text variant="small" weight="semibold" style={s.value} numberOfLines={2}>{value}</Text>
          </View>
        ))}
        <View style={[s.rule, { borderTopColor: c.line }]} />
        <View accessible accessibilityLabel={`${t("promoSeller.ck.total")}: ${som(pkg.price)}`} style={s.row}>
          <Text variant="h4" style={s.label}>{t("promoSeller.ck.total")}</Text>
          <Leader />
          <Text variant="h3">{som(pkg.price)}</Text>
        </View>
      </View>
      <Notice text={t("promoSeller.ck.note")} icon="send" />
    </SectionCard>
  );
}

const s = StyleSheet.create({
  paper: { borderRadius: radius.r, padding: 14, gap: 8 },
  row: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  label: { flexShrink: 1, maxWidth: "45%" },
  leaderBox: { flex: 1, minWidth: 12, overflow: "hidden" },
  dots: { width: 1200 },
  value: { flexShrink: 1, textAlign: "right", maxWidth: "55%" },
  rule: { borderTopWidth: 1, marginVertical: 4 },
});
