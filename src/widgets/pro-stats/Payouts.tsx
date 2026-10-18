import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { sumPayouts } from "@/entities/pro-stats";
import type { Payout } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { tOr } from "@/shared/lib/pro/tOr";
import { Button, Card, Icon, Skeleton, Text } from "@/shared/ui";
import { Divider } from "@/shared/ui/Divider";
import { StatusPill } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { Block } from "./Block";

const PAGE = 5;

// Payout ledger (GET /payouts/me): total on top, waiting vs paid split, then 5 rows at a time.
export function Payouts({ rows, loading }: { rows: Payout[]; loading: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const [shown, setShown] = useState(PAGE);
  const cur = t("adm.currency");
  const total = rows.reduce((a, p) => a + p.amount, 0);
  const visible = rows.slice(0, shown);
  return (
    <Block title={t("aw9.payouts.title")}>
      <Card style={s.card}>
        {loading ? (
          <><Skeleton width="50%" height={28} /><Skeleton height={44} /><Skeleton height={44} /><Skeleton height={44} /></>
        ) : !rows.length ? (
          <View style={s.empty}>
            <Icon name="credit-card" size={20} color={c.gray2} />
            <Text variant="small" tone="gray" style={s.flex}>{t("aw9.payouts.empty")}</Text>
          </View>
        ) : (
          <>
            <View accessible accessibilityLabel={`${t("statUx.total")}: ${fmtMoney(total)} ${cur}`} style={s.totalBox}>
              <Text variant="caption" tone="gray">{t("statUx.total")}</Text>
              <Text variant="h2" numberOfLines={1} adjustsFontSizeToFit>{fmtMoney(total)} {cur}</Text>
            </View>
            <View style={s.split}>
              <Split label={t("aw9.payouts.pending")} value={`${fmtMoney(sumPayouts(rows, false))} ${cur}`} color={c.warn} />
              <Split label={t("aw9.payouts.paid")} value={`${fmtMoney(sumPayouts(rows, true))} ${cur}`} color={c.ok} />
            </View>
            <Divider />
            {visible.map((p, i) => {
              const st = tOr(t, `admSt.${p.status}`, p.status);
              const date = fmtDate(p.createdAt, locale);
              return (
                <View key={p.id || i} style={s.row} accessible accessibilityLabel={`${date}: ${fmtMoney(p.amount)} ${cur}, ${st}`}>
                  <View style={s.flex}>
                    <Text variant="body" weight="semibold" numberOfLines={1}>{fmtMoney(p.amount)} {cur}</Text>
                    <Text variant="caption" tone="gray" numberOfLines={1}>{[date, p.period].filter(Boolean).join(" · ")}</Text>
                  </View>
                  <StatusPill status={p.status} label={st} />
                </View>
              );
            })}
            {rows.length > shown ? <Button title={`${t("statUx.more")} (${Math.min(PAGE, rows.length - shown)})`} variant="soft" size="sm" full onPress={() => setShown((n) => n + PAGE)} /> : null}
          </>
        )}
      </Card>
    </Block>
  );
}

function Split({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.splitItem} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={s.splitHead}><View style={[s.dot, { backgroundColor: color }]} /><Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text></View>
      <Text variant="small" weight="bold" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}


const s = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: 16, gap: 12 },
  totalBox: { gap: 2 },
  split: { flexDirection: "row", gap: 16 },
  splitItem: { flex: 1, gap: 2 },
  splitHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48 },
  empty: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44 },
});
