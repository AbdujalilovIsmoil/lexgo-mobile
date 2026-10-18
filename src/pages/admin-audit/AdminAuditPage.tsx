import { useState } from "react";
import { View } from "react-native";
import { useAuditTrail } from "@/entities/admin-audit";
import { useAuditExport, useAuditFilters } from "@/features/admin-audit";
import { AnomalyList, AuditLog } from "@/widgets/admin-audit";
import { AdminPage, ChipBar } from "@/shared/ui/admin";
import { IconButton, confirmDialog } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";

type Tab = "log" | "anomalies";

// Audit trail: the append-only activity log with hash-chain continuity and CSV export, and the security anomalies.
export default function AdminAuditPage() {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>("log");
  const f = useAuditFilters();
  const q = useAuditTrail(f.filters);
  const exp = useAuditExport();
  const forbidden = q.error instanceof ApiError && q.error.status === 403;
  const tabs = [{ value: "log" as Tab, label: t("admHub.mod.audit.title") }, { value: "anomalies" as Tab, label: t("admAudit.anomalies") }];
  // The backend logs every export, so it is confirmed first.
  const ask = () => !exp.isPending && !forbidden && confirmDialog({ title: t("admAuditB.exportTitle"), message: t("admAuditB.exportText"), confirmLabel: t("admAudit.export"), cancelLabel: t("adm.cancel"), icon: "download", onConfirm: async () => { await exp.mutateAsync(f.filters); } });
  const right = tab === "log" ? <IconButton icon="download" label={t("admAudit.export")} onPress={ask} /> : undefined;
  return (
    <AdminPage title={t("admHub.mod.audit.title")} subtitle={exp.isPending ? t("admAudit.exporting") : undefined} right={right}>
      <View style={{ paddingBottom: 6 }}><ChipBar options={tabs} value={tab} onChange={setTab} /></View>
      {tab === "log" ? <AuditLog f={f} q={q} /> : <AnomalyList />}
    </AdminPage>
  );
}
