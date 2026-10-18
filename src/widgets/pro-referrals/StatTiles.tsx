import { StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/pro-referrals";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { radius, shadows, useColors } from "@/shared/theme";
import { Icon, Skeleton, Text, type IconName } from "@/shared/ui";

function Tile({ icon, label, value, unit, tint }: { icon: IconName; label: string; value: string; unit?: string; tint: string }) {
  const c = useColors();
  return (
    <View accessible accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ""}`} style={[s.tile, shadows.s1, { backgroundColor: c.surface, borderColor: c.line }]}>
      <Icon name={icon} size={18} color={tint} />
      <Text variant="h3" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{value}</Text>
      <Text variant="caption" tone="gray" numberOfLines={2}>{unit ? `${label} · ${unit}` : label}</Text>
    </View>
  );
}

export function StatTiles({ r }: { r?: Referral }) {
  const { t } = useT();
  const c = useColors();
  if (!r) {
    return (
      <View style={s.row}>
        {[0, 1, 2].map((i) => <Skeleton key={i} height={104} round={radius.r} style={s.flex} />)}
      </View>
    );
  }
  return (
    <View style={s.row}>
      <Tile icon="send" tint={c.accent} label={t("refUx.statInvited")} value={String(r.invited)} />
      <Tile icon="user-check" tint={c.ok} label={t("refUx.statActive")} value={String(r.joined)} />
      <Tile icon="trending-up" tint={c.accent} label={t("refUx.statEarned")} value={fmtMoney(r.reward)} unit={t("adm.currency")} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1, width: undefined },
  tile: { flex: 1, minHeight: 104, borderRadius: radius.r, borderWidth: 1, padding: 12, gap: 6 },
});
