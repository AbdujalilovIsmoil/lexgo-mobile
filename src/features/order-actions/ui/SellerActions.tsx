import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { answerState, clock, codeOf, flowErrorKey, msUntil } from "@/entities/market-flow";
import { acceptOrder, declineOrder, DECLINE_REASONS, orderKeys, type DeclineReason } from "@/entities/order";
import { ApiError } from "@/shared/api";
import { Button, Chip, Text, toast } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useNow } from "@/shared/lib/pay/useNow";
import { useT } from "@/shared/i18n";

type Props = { orderId: string; onDone: () => void; deadlineAt?: string };

// For a yurist/advokat looking at an open order: accept it, or decline with a reason. An assignment carries the backend's answer deadline
// (TZ §5): it is counted down once a second and, when it passes (or the backend says so), the buttons go and a neutral line stays.
export function SellerActions({ orderId, onDone, deadlineAt = "" }: Props) {
  const { t } = useT();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState<DeclineReason>("busy");
  const [gone, setGone] = useState<"" | "expired" | "taken">("");
  const now = useNow(!!deadlineAt && !gone, 1000);
  const answer = answerState(deadlineAt, now);
  const run = async (kind: "accept" | "decline") => {
    setBusy(kind);
    try {
      await (kind === "accept" ? acceptOrder(orderId) : declineOrder(orderId, reason));
      successHaptic();
      toast(t(kind === "accept" ? "ord.accepted" : "ord.declined"), "ok");
      void qc.invalidateQueries({ queryKey: orderKeys.list });
      onDone();
    } catch (e) {
      errorHaptic();
      const code = codeOf(e);
      if (code === "assignment_response_deadline_expired" || code === "assignment_not_accepting") setGone("expired");
      else if (e instanceof ApiError && e.status === 409) setGone("taken");
      else toast(flowErrorKey(e) ? t(flowErrorKey(e)) : t("ord.actionFailed"), "err");
      if (e instanceof ApiError && (e.status === 409 || !!code)) void qc.invalidateQueries({ queryKey: orderKeys.list });
    } finally {
      setBusy("");
    }
  };
  if (gone || answer === "expired") return <Text variant="small" tone="gray">{t(gone === "taken" ? "mf.asg.taken" : "mf.asg.expired")}</Text>;
  return (
    <View style={s.col}>
      {answer === "open" ? <Text variant="small" weight="semibold" tone="warn">{t("mf.asg.left", { time: clock(msUntil(deadlineAt, now)) })}</Text> : null}
      {declining ? (
        <>
          <Text variant="small" tone="gray" weight="bold">{t("ord.reason")}</Text>
          <View style={s.chips}>{DECLINE_REASONS.map((r) => <Chip key={r} label={t(`ord.reasons.${r}`)} active={r === reason} onPress={() => setReason(r)} />)}</View>
          <Button title={t("ord.decline")} onPress={() => void run("decline")} loading={busy === "decline"} variant="line" icon="x" full />
        </>
      ) : (
        <View style={s.row}>
          <Button title={t("ord.decline")} onPress={() => setDeclining(true)} variant="line" icon="x" style={s.half} />
          <Button title={t("ord.accept")} onPress={() => void run("accept")} loading={busy === "accept"} variant="gradient" icon="check" style={s.half} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
