import { EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Placeholder for a module whose screen is not built yet.
export function ModuleStub({ id }: { id: string }) {
  const { t } = useT();
  return (
    <AdminPage title={t(`admHub.mod.${id}.title`)}>
      <EmptyState icon="tool" title={t(`admHub.mod.${id}.title`)} text={t(`admHub.mod.${id}.desc`)} />
    </AdminPage>
  );
}
