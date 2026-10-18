import { View } from "react-native";
import { Can } from "@/entities/access";
import type { Approval } from "@/entities/admin-approvals";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useApprove } from "../model/useApprove";

// Labelled "Admin approve" / "Manager approve" buttons (detail sheet); each is disabled once that side has signed (needs approvals.manage).
export function ApproveButtons({ item }: { item: Approval }) {
  const { t } = useT();
  const a = useApprove(item);
  return (
    <Can perm="approvals.manage">
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title={t("admAppr.adminApprove")} icon="check" size="sm" variant="soft" disabled={!a.canAdmin || a.pending} onPress={() => a.ask("admin")} style={{ flex: 1 }} />
        <Button title={t("admAppr.managerApprove")} icon="check" size="sm" variant="line" disabled={!a.canManager || a.pending} onPress={() => a.ask("manager")} style={{ flex: 1 }} />
      </View>
    </Can>
  );
}
