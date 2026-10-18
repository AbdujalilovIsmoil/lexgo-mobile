import { StyleSheet, View } from "react-native";
import type { Lawyer, MatchCandidate } from "@/entities/lawyer";
import { useColors } from "@/shared/theme";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { seller: Lawyer; match?: MatchCandidate; on: boolean; bad: boolean; onPress: () => void };

// One advocate of the order picker: name + verification, rating/experience/success/region,
// the backend's match score with its two main reasons, and the price they charge.
export function SellerRow({ seller: l, match, on, bad, onPress }: Props) {
  const c = useColors();
  const { t } = useT();
  const reasons = (match?.reasons ?? []).filter((r) => r !== "verified").slice(0, 2);
  const reason = (r: string) => { const x = t(`csv.matchReasons.${r}`); return x.startsWith("csv.") ? r.replace(/_/g, " ") : x; };
  const stats = [l.rated ? `★ ${l.rating.toFixed(1)}` : t("csv.unrated"), l.experienceYears ? t("csv.expYears", { n: l.experienceYears }) : "", l.successRate ? t("csv.successRate", { n: l.successRate }) : "", l.region].filter(Boolean);
  return (
    <PressableScale onPress={onPress} style={[s.row, { borderColor: on ? c.accent : bad ? c.err : c.line, backgroundColor: on ? c.tint : c.surface }]}>
      <Avatar name={l.name} size={44} />
      <View style={s.col}>
        <View style={s.name}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={s.flex}>{l.name}</Text>
          {l.verified || match?.reasons.includes("verified") ? <Icon name="check-circle" size={14} color={c.ok} /> : <Text variant="caption" tone="warn">{t("csv.unverified")}</Text>}
        </View>
        <Text variant="caption" tone="gray">{stats.join(" · ")}</Text>
        {match ? <Text variant="caption" tone="accent" weight="semibold">{[t("csv.matchScore", { n: Math.round(match.score) }), ...reasons.map(reason)].join(" · ")}</Text> : null}
      </View>
      <View style={s.price}>
        <Text variant="small" weight="bold" tone="accent">{l.basePrice ? `${fmtMoney(l.basePrice)} ${t("common.currency")}` : t("csv.byRequest")}</Text>
        {on ? <Icon name="check" size={16} color={c.accent} /> : null}
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1.5 },
  col: { flex: 1, gap: 2 },
  name: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flexShrink: 1 },
  price: { alignItems: "flex-end", gap: 4 },
});
