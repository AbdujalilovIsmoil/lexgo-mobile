import { OrgDashboard } from "@/widgets/org-dashboard";
import { OrgScope } from "@/widgets/org-scope";
import { useT } from "@/shared/i18n";

// /org — the owner dashboard of the selected organization.
export default function OrgPage() {
  const { t } = useT();
  return <OrgScope title={t("og1.title")} subtitle={t("og1.subtitle")}>{(org) => <OrgDashboard org={org} />}</OrgScope>;
}
