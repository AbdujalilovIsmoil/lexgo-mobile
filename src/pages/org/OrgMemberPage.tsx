import { OrgScope } from "@/widgets/org-scope";
import { useT } from "@/shared/i18n";
import { MemberBody } from "./MemberBody";

// /org/members/[id] — one member: profile, services (price / status / promotion) and workload.
export default function OrgMemberPage({ memberId }: { memberId: string }) {
  const { t } = useT();
  return <OrgScope title={t("og3.memberTitle")}>{(org) => <MemberBody orgId={org.id} memberId={memberId} />}</OrgScope>;
}
