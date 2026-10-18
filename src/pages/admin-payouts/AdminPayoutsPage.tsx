import { useState } from "react";
import { View } from "react-native";
import { usePayouts, PayoutRow, useReconciliation, type Payout } from "@/entities/admin-payouts";
import { PayoutSheet, ReconciliationCards } from "@/widgets/admin-payouts";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

// Payouts: platform reconciliation on top, status tiles with counts, then one ticket per seller payout.
export default function AdminPayoutsPage() {
  const { t } = useT();
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<Payout | null>(null);
  const counts = useReconciliation().data?.statuses ?? {};
  const q = usePayouts(status);
  const keys = Object.keys(counts).filter((k) => counts[k] > 0);
  const options = [{ value: "", label: t("adm.all"), count: keys.reduce((n, k) => n + counts[k], 0) }, ...keys.map((k) => ({ value: k, label: t(`admSt.${k}`), count: counts[k], alert: k === "failed" }))];
  return (
    <AdminPage title={t("admHub.mod.payouts.title")} right={<><ExportButton id="payments" /><ExportButton id="payouts" /></>}>
      <PagedList
        data={q.data ?? []}
        query={q}
        keyExtractor={(p) => p.id}
        skeletonHeight={100}
        renderItem={(p) => <PayoutRow item={p} onPress={() => setOpen(p)} onPay={() => setOpen(p)} />}
        empty={{ icon: "credit-card", title: t("admPay.empty"), text: t("admPay.emptyText") }}
        header={<><ReconciliationCards />{options.length > 1 ? <View style={{ marginHorizontal: -16, paddingBottom: 12 }}><CcTiles options={options} value={status} onChange={setStatus} /></View> : null}</>}
      />
      <PayoutSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
