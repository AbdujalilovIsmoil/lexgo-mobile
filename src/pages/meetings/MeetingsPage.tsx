import { AdminPage } from "@/shared/ui/admin";
import { MeetingsView } from "@/widgets/meetings";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// /meetings — upcoming and past meetings of any signed-in role, join, create (when allowed); staff also see the platform history.
export default function MeetingsPage() {
  const { t } = useT();
  return (
    <AdminPage title={t("ms7.title")}>
      <MeetingsView bottom={useInsets().bottom + 24} />
    </AdminPage>
  );
}
