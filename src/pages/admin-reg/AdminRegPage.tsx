import { useState } from "react";
import { RequestRow, useSellerRequests, type SellerRequest } from "@/entities/admin-reg";
import { DecisionButtons } from "@/features/admin-reg";
import { RegDetailSheet, RegHeader } from "@/widgets/admin-reg";
import { AdminPage, PagedList, isDate, useDateRange } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

// Seller registration queue: hero, status tiles, role/period filters, accept / reject, detail sheet.
export default function AdminRegPage() {
  const { t } = useT();
  const [status, setStatus] = useState("pending");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState<SellerRequest | null>(null);
  const bar = useDateRange("all");
  const from = isDate(bar.range.from) ? bar.range.from : "";
  const to = isDate(bar.range.to) ? bar.range.to : "";
  const q = useSellerRequests({ status, role, from, to });
  const header = <RegHeader stats={q.data?.stats} status={status} onStatus={setStatus} role={role} onRole={setRole} bar={bar} />;
  return (
    <AdminPage title={t("admHub.mod.registerRequests.title")} subtitle={t("admReg.lead")} right={<ExportButton id="sellerRequests" />}>
      <PagedList
        skeletonHeight={110}
        data={q.data?.items ?? []}
        query={{ isLoading: q.isLoading || q.isPlaceholderData, isError: q.isError, error: q.error, refetch: q.refetch, isRefetching: q.isRefetching }}
        keyExtractor={(r) => r.id}
        renderItem={(r) => (
          <RequestRow item={r} onPress={() => setOpen(r)} actions={r.status === "pending" ? <DecisionButtons target={{ id: r.id, name: r.name }} /> : undefined} />
        )}
        empty={{ icon: "user-plus", title: t("admReg.empty"), text: t("admReg.emptyText") }}
        header={header}
      />
      <RegDetailSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
