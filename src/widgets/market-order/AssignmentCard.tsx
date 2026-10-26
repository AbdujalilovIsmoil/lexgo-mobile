import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { answerState, clock, msUntil, type FlowOrder } from "@/entities/market-flow";
import { useAnswer } from "@/features/market-flow";
import { DeclineSheet } from "@/features/pro-order-actions";
import type { ProOrder } from "@/entities/pro-order";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useServerNow } from "@/shared/network";

type Props = { order: ProOrder; flow: FlowOrder; acceptAllowed: boolean };

// TZ §5: an order assigned to this seller. The countdown runs to the absolute backend deadline (ticking once a second); when it passes the
// buttons close, a neutral "expired" line stays and the order is re-read — the call center reassigns it, the seller does nothing more.
export function AssignmentCard({ order, flow, acceptAllowed }: Props) {
  const c = useColors();
  const { t } = useT();
  const qc = useQueryClient();
  const a = useAnswer(order.id);
  const [declining, setDeclining] = useState(false);
  const now = useServerNow(!a.outcome, 1000);
  const state = answerState(flow.acceptanceDeadlineAt, now);
  const expired = state === "expired" || a.outcome === "expired";
  const refetched = useRef(false);
  useEffect(() => {
    if (!expired || refetched.current) return;
    refetched.current = true;
    void qc.invalidateQueries({ queryKey: ["pro-order"] });
  }, [expired, qc]);
  if (state === "none") return null;
  const done = a.outcome === "accepted" || a.outcome === "declined" || a.outcome === "taken" || a.outcome === "forbidden";
  const left = msUntil(flow.acceptanceDeadlineAt, now);
  const tone = expired ? c.gray : left < 5 * 60 * 1000 ? c.err : c.warn;
  return (
    <View style={[s.box, { backgroundColor: expired || done ? c.surface2 : c.warnBg }]}>
      <View style={s.head}>
        <Icon name={expired ? "clock" : "user-check"} size={20} color={tone} />
        <Text variant="body" weight="bold" style={s.flex}>{t("mf.asg.title")}</Text>
        {!expired && !done ? <Text variant="h4" style={{ color: tone }} accessibilityLabel={t("mf.asg.left", { time: clock(left) })}>{clock(left)}</Text> : null}
      </View>
      {expired ? <Text variant="small" tone="gray">{t("mf.asg.expired")}</Text>
        : a.outcome === "accepted" ? <Text variant="small" tone="ok">{t("mf.asg.accepted")}</Text>
        : a.outcome === "declined" ? <Text variant="small" tone="gray">{t("mf.asg.declined")}</Text>
        : a.outcome === "taken" ? <Text variant="small" tone="gray">{t("mf.asg.taken")}</Text>
        : a.outcome === "forbidden" ? <Text variant="small" tone="gray">{t("mf.asg.forbidden")}</Text>
        : (
          <>
            <Text variant="small" tone="gray">{t("mf.asg.hint")}</Text>
            {acceptAllowed ? (
              <View style={s.row}>
                <Button title={t("mf.asg.accept")} icon="check" variant="gradient" loading={a.accept.isPending} disabled={a.busy} onPress={() => a.accept.mutate(undefined)} style={s.flex} />
                <Button title={t("mf.asg.decline")} icon="x" variant="line" disabled={a.busy} onPress={() => setDeclining(true)} style={s.flex} />
              </View>
            ) : <Text variant="caption" tone="warn">{t("mf.asg.forbidden")}</Text>}
          </>
        )}
      <DeclineSheet order={order} visible={declining} onClose={() => setDeclining(false)} submitting={a.decline.isPending} onSubmit={(v) => a.decline.mutate(v, { onSettled: () => setDeclining(false) })} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 20, padding: 16, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
