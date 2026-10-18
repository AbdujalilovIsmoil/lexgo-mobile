import { useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import { ChipBar, PagedList, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { WorkRow, WorkSheet, useDashboard, useWorkload, type WorkItem } from "@/entities/organization";
import { ExportButton } from "@/features/org-export";

const STATUSES = ["", "pending", "accepted", "in_progress", "paid", "completed", "cancelled"];
type Props = { orgId: string; memberId?: string; lead?: ReactNode };

// Orders of the organization's members (GET …/owner/workload): filter by member and status, export, details in a drawer.
export function WorkloadList({ orgId, memberId, lead }: Props) {
  const { t } = useT();
  const [member, setMember] = useState(memberId ?? "");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<WorkItem | null>(null);
  const dash = useDashboard(orgId);
  const names = useMemo(() => new Map((dash.data?.members ?? []).map((m) => [m.userId, m.name] as const)), [dash.data]);
  const { items, total, query } = useWorkload(orgId, member, status);
  const nameOf = (id: string) => names.get(id) ?? "";
  return (
    <>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(w) => w.id}
        renderItem={(w) => <WorkRow item={w} memberName={nameOf(w.memberUserId)} onPress={() => setOpen(w)} />}
        empty={{ icon: "inbox", title: t("og4.empty"), text: t("og4.emptyText") }}
        header={
          <View style={{ gap: 10, marginBottom: 12 }}>
            {lead}
            {memberId ? null : <SelectField label={t("og4.member")} value={member} onChange={setMember} options={[{ value: "", label: t("og4.allMembers") }, ...[...names].map(([value, label]) => ({ value, label: label || value }))]} searchable />}
            <View style={{ marginHorizontal: -16 }}><ChipBar value={status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: s ? t(`og9.st.${s}`) : t("adm.all") }))} /></View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="small" tone="gray">{t("adm.total")}: {total ?? items.length}</Text>
              <ExportButton orgId={orgId} memberId={member} status={status} nameOf={nameOf} />
            </View>
          </View>
        }
      />
      <WorkSheet item={open} memberName={open ? nameOf(open.memberUserId) : undefined} onClose={() => setOpen(null)} />
    </>
  );
}
