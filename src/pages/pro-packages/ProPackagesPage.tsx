import { PackagesPanel } from "@/widgets/package-list";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Standalone /pro/packages route: the "Paketlar" panel in the page shell (it also embeds as the services page's second tab).
export default function ProPackagesPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("pkgSeller.title")}>
      <PackagesPanel />
    </AdminPage>
  );
}
