import type { ReactNode } from "react";
import { useAccess } from "@/entities/access";
import { HRM_PERMS } from "@/entities/admin-hrm";
import { EmptyState } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Sub-area guard: mirrors the web sidebar (an item with a permission needs it), so a deep link cannot bypass the hub.
export function PermGate({ area, children }: { area: string; children: ReactNode }) {
  const { t } = useT();
  const a = useAccess();
  const perm = HRM_PERMS[area];
  if (perm && !a.canInternal(perm)) {
    return (
      <AdminPage title={t(`admHrm.nav.${area}`)}>
        <EmptyState icon="lock" title={t("admHub.forbidden")} />
      </AdminPage>
    );
  }
  return <>{children}</>;
}
