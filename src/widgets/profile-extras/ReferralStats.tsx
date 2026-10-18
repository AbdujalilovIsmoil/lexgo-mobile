import { StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/profile-extras";
import { fmtUzs } from "@/entities/payment";
import { Card, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ReferralJourney } from "./ReferralJourney";

function Tile({ icon, tint, label, value }: { icon: IconName; tint: string; label: string; value: string }) {
  return (
    <View style={s.tile}>
      <View style={[s.ico, { backgroundColor: tint + "26" }]}><Icon name={icon} size={16} color={tint} /></View>
      <Text variant="h4" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
    </View>
  );
}

// Invited / joined / bonus in one row, then the journey to the discount.
export function ReferralStats({ r }: { r: Referral }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      <Card style={s.row}>
        <Tile icon="send" tint={c.accent} label={t("py7.ref.invited")} value={String(r.invited)} />
        <View style={[s.sep, { backgroundColor: c.line }]} />
        <Tile icon="user-check" tint="#00A870" label={t("py7.ref.joined")} value={String(r.joined)} />
        <View style={[s.sep, { backgroundColor: c.line }]} />
        <Tile icon="award" tint="#F59E0B" label={t("py7.ref.reward")} value={fmtUzs(r.reward, t)} />
      </Card>
      <ReferralJourney r={r} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: "row", alignItems: "stretch", padding: 6 },
  sep: { width: 1, marginVertical: 8 },
  tile: { flex: 1, gap: 6, padding: 10 },
  ico: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
