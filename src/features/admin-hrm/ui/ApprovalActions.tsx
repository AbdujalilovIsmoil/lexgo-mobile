import { View } from "react-native";
import { CcAction } from "@/shared/ui/cc";
import { confirmDialog } from "@/shared/ui";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import type { Approval } from "@/entities/admin-hrm";
import { useDecide } from "../model/useWorkActions";

// Round reject / approve buttons of a pending approval row; each asks for confirmation before deciding (no comment).
export function ApprovalActions({ item }: { item: Approval }) {
  const { t } = useT();
  const decide = useDecide();
  if (item.status !== "pending") return null;
  const go = (decision: "approved" | "rejected") => {
    tapHaptic();
    confirmDialog({
      title: t(`admHrm.${decision}Title`), message: item.title, confirmLabel: t(`admHrm.${decision === "approved" ? "approve" : "reject"}`), cancelLabel: t("adm.cancel"),
      icon: decision === "approved" ? "check-circle" : "x-circle", danger: decision === "rejected",
      onConfirm: async () => { await decide.mutateAsync({ id: item.id, decision, comment: "" }); },
    });
  };
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <CcAction icon="x" label={t("admHrm.reject")} onPress={() => go("rejected")} />
      <CcAction icon="check" label={t("admHrm.approve")} primary loading={decide.isPending} onPress={() => go("approved")} />
    </View>
  );
}
