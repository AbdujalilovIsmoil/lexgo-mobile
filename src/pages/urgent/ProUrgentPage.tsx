import { AdminPage } from "@/shared/ui/admin";
import { ProUrgent } from "@/widgets/urgent";
import { useT } from "@/shared/i18n";

// /pro/urgent — the advocate's Tezkor cases (and the open pool for a call-center lawyer).
export default function ProUrgentPage() {
  const { t } = useT();
  return <AdminPage title={t("ug5.title")} subtitle={t("ug5.lead")}><ProUrgent /></AdminPage>;
}
