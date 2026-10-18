import { useMemo, useState } from "react";
import { EmptyState, Segmented } from "@/shared/ui";
import { QueryBoundary } from "@/shared/ui/admin";
import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";
import { useDashboard } from "@/entities/organization";
import { MemberFormSheet } from "@/features/org-member-form";
import { MemberHeader, MemberServices } from "@/widgets/org-member";
import { WorkloadList } from "@/widgets/org-workload";

type Tab = "services" | "workload";

// One member of the selected organization: profile card, role edit, and tabs (services / workload).
export function MemberBody({ orgId, memberId }: { orgId: string; memberId: string }) {
  const { t } = useT();
  const router = useRouter();
  const q = useDashboard(orgId);
  const [tab, setTab] = useState<Tab>("services");
  const [editing, setEditing] = useState(false);
  const member = useMemo(() => q.data?.members.find((m) => m.userId === memberId) ?? null, [q.data, memberId]);
  if (q.isSuccess && !member) return <EmptyState icon="user-x" title={t("og3.notFound")} text={t("og3.notFoundText")} actionLabel={t("adm.back")} onAction={() => router.back()} />;
  const lead = member ? (
    <>
      <MemberHeader member={member} onEditRole={() => setEditing(true)} />
      <Segmented value={tab} onChange={setTab} options={[{ value: "services", label: t("og3.tab.services") }, { value: "workload", label: t("og3.tab.workload") }]} />
    </>
  ) : null;
  return (
    <QueryBoundary query={q}>
      {member && lead ? (tab === "services" ? <MemberServices orgId={orgId} member={member} lead={lead} /> : <WorkloadList orgId={orgId} memberId={memberId} lead={lead} />) : null}
      <MemberFormSheet visible={editing} orgId={orgId} edit={member} existing={new Set()} onClose={() => setEditing(false)} />
    </QueryBoundary>
  );
}
