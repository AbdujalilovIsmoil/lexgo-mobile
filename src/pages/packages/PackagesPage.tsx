import { PackageList } from "@/widgets/package-list";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Client "Xizmat paketlari" (profile menu → Ishlar va hujjatlar): GET /service-packages.
export function PackagesPage() {
  const { t } = useT();
  return <AdminPage title={t("mk8.title")}><PackageList /></AdminPage>;
}
