import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { answerState, clock, msUntil } from "@/entities/market-flow";
import { DECLINE_REASONS, type DeclineReason } from "@/entities/pro-order";
import { useAnswer } from "@/features/market-flow";
import { Button, Chip, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useServerNow } from "@/shared/network";

type Props = { orderId: string; onDone: () => void; deadlineAt?: string };

// For a yurist/advokat looking at an open order: accept it, or decline with a reason. An assignment carries the backend's answer deadline
// (TZ §5): it is counted down once a second and, when it passes (or the backend says so), the buttons go and a neutral line stays. The
// answer itself is useAnswer's, the same as the assignment card's.
export function SellerActions({ orderId, onDone, deadlineAt = "" }: Props) {
  const { t } = useT();
  const { outcome, accept, decline, busy } = useAnswer(orderId);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState<DeclineReason>("busy");
  const gone = outcome === "expired" || outcome === "taken" || outcome === "forbidden";
  const now = useServerNow(!!deadlineAt && !gone, 1000, Date.parse(deadlineAt));
  const answer = answerState(deadlineAt, now);
  useEffect(() => {
    if (outcome === "accepted" || outcome === "declined") onDone();
  }, [outcome, onDone]);
  if (gone || answer === "expired") return <Text variant="small" tone="gray">{t(outcome === "taken" ? "mf.asg.taken" : "mf.asg.expired")}</Text>;
  return (
    <View style={s.col}>
      {answer === "open" ? <Text variant="small" weight="semibold" tone="warn">{t("mf.asg.left", { time: clock(msUntil(deadlineAt, now)) })}</Text> : null}
      {declining ? (
        <>
          <Text variant="small" tone="gray" weight="bold">{t("sl9.reason")}</Text>
          <View style={s.chips}>{DECLINE_REASONS.map((r) => <Chip key={r} label={t(`sl12.reasons.${r}`)} active={r === reason} onPress={() => setReason(r)} />)}</View>
          <Button title={t("sl9.decline")} onPress={() => decline.mutate({ reason, note: "" })} loading={decline.isPending} disabled={busy} variant="line" icon="x" full />
        </>
      ) : (
        <View style={s.row}>
          <Button title={t("sl9.decline")} onPress={() => setDeclining(true)} variant="line" icon="x" style={s.half} />
          <Button title={t("sl9.accept")} onPress={() => accept.mutate(undefined)} loading={accept.isPending} disabled={busy} variant="gradient" icon="check" style={s.half} />
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
