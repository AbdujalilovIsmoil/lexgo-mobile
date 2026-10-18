import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Icon, Skeleton, Text, toast } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { ApiError, isForbidden } from "@/shared/api";
import { fmtDateTime } from "@/shared/lib/format";
import { caseKeys, clientMoves, moveOrder, useOrderHistory } from "@/entities/client-case";
import { noteSchema } from "./noteSchema";
import { useCaseText } from "./useCaseText";

type Props = { orderId: string; status: string };

// order_status_history as a timeline plus the next steps the client may take (PATCH /orders/{id}/status).
export function HistoryPanel({ orderId, status }: Props) {
  const { t, locale } = useT();
  const text = useCaseText();
  const qc = useQueryClient();
  const q = useOrderHistory(orderId);
  const f = useAppForm(noteSchema, { note: "" });
  const [busy, setBusy] = useState("");
  const rows = q.data ?? [];
  const current = (status || rows[0]?.status || "").toLowerCase();
  const next = clientMoves(current);
  const move = async (to: string, note: string) => {
    setBusy(to);
    try {
      await moveOrder(orderId, to, note || undefined);
      f.reset({ note: "" });
      toast(t("ccs.hist.moved", { status: text.order(to) }), "ok");
      void qc.invalidateQueries({ queryKey: caseKeys.all });
    } catch (e) {
      toast(e instanceof ApiError && e.status === 409 ? t("ccs.hist.conflict") : isForbidden(e) ? t("ccs.hist.forbidden") : t("ccs.hist.error"), "err");
    } finally { setBusy(""); }
  };
  return (
    <View style={s.wrap}>
      <Text variant="small" weight="bold">{t("ccs.hist.title")}</Text>
      {q.isLoading ? <Skeleton height={44} round={12} /> : q.isError ? <Text variant="caption" tone="err">{t("ccs.hist.loadError")}</Text> : !rows.length ? <Text variant="caption" tone="gray">{t("ccs.hist.empty")}</Text> : rows.map((r, i) => (
        <View key={`${r.at}-${i}`} style={s.row}>
          <Icon name={i === 0 ? "clock" : "check"} size={14} tone={i === 0 ? "accent" : "gray"} />
          <View style={s.flex}>
            <Text variant="small" weight="semibold">{text.order(r.status)}</Text>
            <Text variant="caption" tone="gray">{fmtDateTime(r.at, locale)}{r.note ? ` · ${r.note}` : ""}</Text>
          </View>
        </View>
      ))}
      {next.length ? (
        <View style={s.wrap}>
          <Text variant="caption" tone="gray">{t("ccs.hist.nextStep")}</Text>
          <FormInput control={f.control} name="note" placeholder={t("ccs.hist.notePh")} maxLength={300} />
          <View style={s.btns}>{next.map((x) => <Button key={x} title={t(`ccs.hist.actions.${x}`)} size="sm" variant={x === "cancelled" ? "line" : "primary"} loading={busy === x} disabled={!!busy} onPress={() => void f.handleSubmit((v) => move(x, v.note))()} />)}</View>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 4 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
  btns: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
