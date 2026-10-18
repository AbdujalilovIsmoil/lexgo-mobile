import { RowCard } from "@/shared/ui/admin";
import { useOrgText } from "../lib/useOrgText";
import type { OrgMember } from "../model/workTypes";
import { OrgStatus } from "./OrgStatus";
import { WorkloadChips } from "./WorkloadChips";

// One member in a list: avatar, name, role in the organization · seller type, verification, workload.
export function MemberRow({ member: m, onPress }: { member: OrgMember; onPress?: () => void }) {
  const text = useOrgText();
  const inactive = m.status !== "active";
  return (
    <RowCard avatar={m.name || "?"} title={m.name || "—"} subtitle={[m.title, text.kind(m.sellerType)].filter(Boolean).join(" · ")} meta={inactive ? text.status(m.status) : text.region(m.region)} right={<OrgStatus status={m.verification} />} onPress={onPress}>
      <WorkloadChips w={m.workload} />
    </RowCard>
  );
}
