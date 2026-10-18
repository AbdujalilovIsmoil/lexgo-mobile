import { useState } from "react";
import { View } from "react-native";
import { ApprovalTicket, statusText, typeLabel, useApprovals, type Approval } from "@/entities/admin-approvals";
import { ApproveActions } from "@/features/admin-approvals";
import { InfoButton } from "@/features/admin-moduleinfo";
import { ApprovalSheet, ApprovalsHero } from "@/widgets/admin-approvals";
import { AdminPage, PagedList, SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Two-step approval queue (admin + manager): hero numbers, status tiles, search, tickets with round sign buttons, detail sheet.
export default function AdminApprovalsPage() {
  const { t } = useT();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Approval | null>(null);
  const query = useApprovals();
  const all = query.data ?? [];
  const statuses = [...new Set(all.map((a) => a.status).filter(Boolean))];
  const tiles = [{ value: "", label: t("adm.all"), count: all.length }, ...statuses.map((s) => ({ value: s, label: statusText(t, s), count: all.filter((a) => a.status === s).length, alert: s === "pending" }))];
  const needle = q.trim().toLowerCase();
  const hit = (a: Approval) => !needle || [a.workId, typeLabel(t, a.type), a.summary, a.reason].some((x) => x.toLowerCase().includes(needle));
  const shown = all.filter((a) => (!status || a.status === status) && hit(a));
  const bleed = { marginHorizontal: -16 } as const;
  const header = (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      {all.length ? <ApprovalsHero list={all} /> : null}
      {all.length ? <View style={[bleed, { gap: 10 }]}><SearchBox value={q} onChangeText={setQ} placeholder={t("admApprB.search")} /><CcTiles options={tiles} value={status} onChange={setStatus} /></View> : null}
    </View>
  );
  return (
    <AdminPage title={t("admHub.mod.approvals.title")} subtitle={t("admAppr.lead")} right={<InfoButton path="/approvals/info" />}>
      <PagedList
        data={shown}
        query={query}
        keyExtractor={(a) => a.id}
        renderItem={(a) => <ApprovalTicket item={a} onPress={() => setOpen(a)} actions={<ApproveActions item={a} />} />}
        empty={all.length ? { icon: "search", title: t("admApprB.noMatch") } : { icon: "check-square", title: t("admAppr.empty"), text: t("admAppr.emptyText") }}
        off={{ title: t("admApprB.off"), text: t("admApprB.offText") }}
        skeletonHeight={104}
        header={header}
      />
      <ApprovalSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}
