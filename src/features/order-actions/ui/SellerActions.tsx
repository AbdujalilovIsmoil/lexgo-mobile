import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { acceptOrder, declineOrder, DECLINE_REASONS, orderKeys, type DeclineReason } from "@/entities/order";
import { Button, Chip, Text, toast } from "@/shared/ui";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

type Props = { orderId: string; onDone: () => void };

// For a yurist/advokat looking at an open order: accept it, or decline with a reason.
export function SellerActions({ orderId, onDone }: Props) {
  const { t } = useT();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState<DeclineReason>("busy");
  const run = async (kind: "accept" | "decline") => {
    setBusy(kind);
    try {
      await (kind === "accept" ? acceptOrder(orderId) : declineOrder(orderId, reason));
      successHaptic();
      toast(t(kind === "accept" ? "ord.accepted" : "ord.declined"), "ok");
      void qc.invalidateQueries({ queryKey: orderKeys.list });
      onDone();
    } catch {
      errorHaptic();
      toast(t("ord.actionFailed"), "err");
    } finally {
      setBusy("");
    }
  };
  return (
    <View style={s.col}>
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
