import { useT } from "@/shared/i18n";
import { AdminPage } from "@/shared/ui/admin";
import { FileBrowser } from "@/widgets/pro-file-browser";

// /pro/files — workspace storage (opens after the administrator approves the professional).
export default function ProFilesPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("aw8.title")} subtitle={t("aw8.sub")}>
      <FileBrowser />
    </AdminPage>
  );
}
