import { StyleSheet, View } from "react-native";
import { usePayouts } from "@/entities/pro-workspace";
import { fmtMoney } from "@/shared/lib/money";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { Divider, Pill, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Panel } from "./Panel";
import { Tile, tilesStyle } from "./Tile";
import { useGrid } from "@/shared/lib/useGrid";
import Animated from "react-native-reanimated";

const MIN_PAYOUT = 100_000; // so'm (S-30)
const PAID = new Set(["paid", "released", "completed", "done"]);

// The payout is weekly, on Thursdays: the date of the next one.
function nextThursday(from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
  return d;
}

// "Hisob-kitob (payout)": what waits for the weekly payout, what was paid, how many records, the rule (minimum amount) and the
// latest twelve payouts as rows.
export function PayoutsPanel({ i }: { i: number }) {
  const grid = useGrid({ count: 2 });
  const { t, locale } = useT();
  const c = useColors();
  const q = usePayouts();
  const rows = q.data ?? [];
  const pending = rows.filter((p) => !PAID.has(p.status)).reduce((a, p) => a + p.amount, 0);
  const paid = rows.filter((p) => PAID.has(p.status)).reduce((a, p) => a + p.amount, 0);
  const som = t("shm.sd.payouts.som");
  const word = (s: string) => { const k = `shm.sd.payouts.status.${s}`; return t(k) === k ? s : t(k); };
  return (
    <Panel i={i} icon="credit-card" tint="#F59E0B" title={t("shm.sd.payouts.title")} fold={`${fmtMoney(pending)} ${som} · ${t("shm.sd.payouts.nextPayout", { date: fmtDate(nextThursday().toISOString(), locale) })}`} sub={t("shm.sd.payouts.nextPayout", { date: fmtDate(nextThursday().toISOString(), locale) })}>
      {q.isLoading ? <Skeleton height={120} round={16} /> : (
        <>
          <View style={tilesStyle.grid} onLayout={grid.onLayout}>
            {grid.ready ? (
              <>
                <Animated.View layout={grid.move} style={[tilesStyle.half, grid.cell]}><Tile icon="clock" tone={c.warn} value={`${fmtMoney(pending)} ${som}`} label={t("shm.sd.payouts.pending")} /></Animated.View>
                <Animated.View layout={grid.move} style={[tilesStyle.half, grid.cell]}><Tile icon="check" tone={c.ok} value={`${fmtMoney(paid)} ${som}`} label={t("shm.sd.payouts.paid")} /></Animated.View>
              </>
            ) : null}
          </View>
          <Text variant="caption" tone="gray">{pending > 0 && pending < MIN_PAYOUT ? t("shm.sd.payouts.belowMin", { min: fmtMoney(MIN_PAYOUT) }) : t("shm.sd.payouts.rule", { min: fmtMoney(MIN_PAYOUT) })}</Text>
          {rows.length ? rows.slice(0, 12).map((p, k) => (
            <View key={p.id || k}>
              {k ? <Divider /> : null}
              <View style={s.row}>
                <View style={s.flex}>
                  <Text variant="small" weight="bold">{fmtMoney(p.amount)} {som}</Text>
                  <Text variant="caption" tone="gray">{[fmtDate(p.createdAt, locale), p.period].filter(Boolean).join(" · ")}</Text>
                </View>
                <Pill label={word(p.status)} tone={PAID.has(p.status) ? "ok" : "warn"} small />
              </View>
            </View>
          )) : <View style={s.empty}><Text variant="small" weight="bold">{t("shm.sd.payouts.empty")}</Text><Text variant="caption" tone="gray">{t("shm.sd.payouts.emptyText")}</Text></View>}
        </>
      )}
    </Panel>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }, flex: { flex: 1, gap: 2 }, empty: { gap: 4 } });
