import { WorkloadList } from "@/widgets/org-workload";
import { OrgScope } from "@/widgets/org-scope";
import { useT } from "@/shared/i18n";

// /org/workload — every order of the members, filterable, exportable.
export default function OrgWorkloadPage() {
  const { t } = useT();
  return <OrgScope title={t("og4.title")}>{(org) => <WorkloadList orgId={org.id} />}</OrgScope>;
}
