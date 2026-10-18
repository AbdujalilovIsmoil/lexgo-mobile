import { useCallback, useState } from "react";
import { View } from "react-native";
import { ApprovalRow, stLabel, useApprovalsPaged, useLive, useNames, type Approval } from "@/entities/admin-hrm";
import { ApprovalActions, DecisionSheet } from "@/features/admin-hrm";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

const STATUSES = ["pending", "approved", "rejected", ""] as const;

// Approvals waiting for my decision (and my past decisions): review, comment, approve or reject.
export default function MyApprovalsPage() {
  const { t } = useT();
  const [status, setStatus] = useState<string>("pending");
  const [open, setOpen] = useState<Approval | null>(null);
  const { items, query: paged } = useApprovalsPaged(status);
  const names = useNames();
  const show = useCallback((a: Approval) => setOpen(a), []);
  useLive();
  return (
    <AdminPage title={t("admHrm.nav.approvals")} subtitle={t("admHrmB.navDesc.approvals")}>
      <PagedList
        data={items} query={paged} keyExtractor={(x) => x.id} renderItem={(x, i) => <ApprovalRow index={i} item={x} who={names.user(x.requesterId)} onPress={show} actions={<ApprovalActions item={x} />} />}
        empty={{ icon: "shield", title: t("admHrm.noApprovals") }}
        header={<View style={{ marginHorizontal: -16, marginBottom: 10 }}><CcTiles options={STATUSES.map((s) => ({ value: s as string, label: s ? stLabel(t, s) : t("adm.all"), alert: s === "pending" }))} value={status} onChange={setStatus} /></View>}
      />
      <DecisionSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
