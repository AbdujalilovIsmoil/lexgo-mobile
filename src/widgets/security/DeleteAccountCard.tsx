import { useSessionStore } from "@/entities/session";
import { useCreateTicket } from "@/entities/support";
import { useLogout } from "@/features/auth";
import { ListRow, confirmDialog, toast } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

// Account deletion (App Store 5.1.1 / Play "account deletion"): the backend has no self-delete endpoint yet, so the
// request goes to support as an "account" ticket the operators process, and the app signs the person out at once.
export function DeleteAccountCard() {
  const { t } = useT();
  const role = useSessionStore((s) => s.session?.user.role ?? "client");
  const create = useCreateTicket();
  const { run: signOut } = useLogout();

  const send = async () => {
    try {
      await create.mutateAsync({ message: t("admSec.delMessage"), category: "account", urgent: false, topicPicked: true, turns: [], aiSessionId: "", role, path: "/security" });
      toast(t("admSec.delSent"), "ok");
      await signOut();
    } catch {
      toast(t("admSec.delErr"), "err");
    }
  };

  const ask = () =>
    confirmDialog({
      title: t("admSec.delConfirmTitle"),
      message: t("admSec.delConfirmText"),
      confirmLabel: t("admSec.delConfirm"),
      cancelLabel: t("common.cancel"),
      icon: "trash-2",
      danger: true,
      onConfirm: send,
    });

  return (
    <SectionCard title={t("admSec.delTitle")}>
      <ListRow icon="trash-2" danger title={t("admSec.delRow")} sub={t("admSec.delSub")} onPress={ask} />
    </SectionCard>
  );
}
