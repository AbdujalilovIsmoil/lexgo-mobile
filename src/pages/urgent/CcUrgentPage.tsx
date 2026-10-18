import { AdminPage } from "@/shared/ui/admin";
import { CcQueue } from "@/widgets/urgent";
import { useT } from "@/shared/i18n";

// /cc/urgent — the call-center console for Tezkor Advokat requests.
export default function CcUrgentPage() {
  const { t } = useT();
  return <AdminPage title={t("ug6.title")} subtitle={t("ug6.lead")}><CcQueue /></AdminPage>;
}
