import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Text, confirmDialog, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { humanizeSlug } from "@/shared/lib/format";
import { openUrl } from "@/shared/lib/links";
import { isForbidden, ApiError } from "@/shared/api";
import { caseKeys, payMilestone, releaseMilestone, useMilestones, type Milestone } from "@/entities/client-case";
import { PAYMENT_PROVIDER } from "@/shared/config/env";

const UNPAID = ["waiting_payment", "payment_pending", "pending"];

// Payment stages (30/40/30): pay the next one on the provider page, release a paid one when the work is done.
export function MilestonesPanel({ orderId }: { orderId: string }) {
  const { t } = useT();
  const qc = useQueryClient();
  const q = useMilestones(orderId);
  const [busy, setBusy] = useState("");
  const rows = q.data ?? [];
  const readOnly = !!q.error && isForbidden(q.error);
  const reload = () => void qc.invalidateQueries({ queryKey: caseKeys.stages(orderId) });
  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.status === 409) { reload(); toast(t("ccs.ms.conflict"), "err"); } else toast(isForbidden(e) ? t("ccs.ms.forbidden") : t("ccs.ms.error"), "err");
  };
  const pay = async (m: Milestone) => {
    setBusy(m.id);
    try {
      const r = await payMilestone(orderId, m.id, PAYMENT_PROVIDER);
      if (r.url) { openUrl(r.url); toast(t("ccs.payOpen"), "ok"); } else if (r.paymentId && !PAYMENT_PROVIDER.startsWith("demo")) toast(t("ccs.noLink"), "err");
      reload();
    } catch (e) { fail(e); } finally { setBusy(""); }
  };
  const release = (m: Milestone) => confirmDialog({
    title: t("ccs.ms.release"), message: t("ccs.ms.releaseConfirm"), confirmLabel: t("ccs.ms.releaseYes"), cancelLabel: t("ccs.cancel"),
    onConfirm: async () => {
      try { await releaseMilestone(orderId, m.id); toast(t("ccs.ms.releasedMsg"), "ok"); reload(); } catch (e) { fail(e); }
    },
  });
  if (!rows.length) return null;
  const first = rows.findIndex((m) => UNPAID.includes(m.status));
  const label = (s: string) => (t(`ccs.ms.status.${s}`) !== `ccs.ms.status.${s}` ? t(`ccs.ms.status.${s}`) : humanizeSlug(s));
  return (
    <View style={s.wrap}>
      <Text variant="small" weight="bold">{t("ccs.ms.title")}</Text>
      {rows.map((m, i) => (
        <View key={m.id} style={s.row}>
          <View style={s.flex}>
            <Text variant="small" weight="semibold">{m.title || t("ccs.ms.stage", { n: m.index || i + 1 })}</Text>
            <Text variant="caption" tone="gray">{[m.percent ? `${m.percent}%` : "", `${fmtMoney(m.amount)} ${t("common.currency")}`, label(m.status)].filter(Boolean).join(" · ")}</Text>
          </View>
          {!readOnly && i === first ? <Button title={t("ccs.ms.pay")} size="sm" loading={busy === m.id} onPress={() => void pay(m)} /> : null}
          {!readOnly && (m.status === "paid" || m.status === "held") ? <Button title={t("ccs.ms.release")} size="sm" variant="line" disabled={!!busy} onPress={() => release(m)} /> : null}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
});
