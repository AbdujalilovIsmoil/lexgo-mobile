import { MemberList } from "@/widgets/org-members";
import { MemberFormSheet } from "@/features/org-member-form";
import { useDashboard } from "@/entities/organization";
import { useMemo } from "react";

// The roster plus the "add member" drawer (members already in the organization are marked in it).
export function MembersBody({ orgId, adding, onClose }: { orgId: string; adding: boolean; onClose: () => void }) {
  const dash = useDashboard(orgId);
  const existing = useMemo(() => new Set((dash.data?.members ?? []).map((m) => m.userId)), [dash.data]);
  return (
    <>
      <MemberList orgId={orgId} />
      <MemberFormSheet visible={adding} orgId={orgId} existing={existing} onClose={onClose} />
    </>
  );
}
