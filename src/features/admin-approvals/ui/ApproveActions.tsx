import { Can } from "@/entities/access";
import type { Approval } from "@/entities/admin-approvals";
import { CcAction } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { useApprove } from "../model/useApprove";

// Round sign-off buttons of a ticket row: shield = admin, user-check = manager; a side that already signed has no button.
export function ApproveActions({ item }: { item: Approval }) {
  const { t } = useT();
  const a = useApprove(item);
  return (
    <Can perm="approvals.manage">
      {a.canAdmin ? <CcAction primary icon="shield" label={t("admAppr.adminApprove")} loading={a.pending} onPress={() => a.ask("admin")} /> : null}
      {a.canManager ? <CcAction primary={!a.canAdmin} icon="user-check" label={t("admAppr.managerApprove")} loading={a.pending} onPress={() => a.ask("manager")} /> : null}
    </Can>
  );
}
