import { StyleSheet } from "react-native";
import { useSessionStore } from "@/entities/session";
import { useCreateTicket } from "@/entities/support";
import { Icon, PressableScale, Text, confirmDialog, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const RED = "#EF4444";

// The last button of the profile (App Store 5.1.1(v)): Yes / No, then "request received". The backend has no self-delete endpoint, so the
// request quietly goes to support as an "account" ticket the operators process; the person stays signed in.
export function DeleteAccountButton() {
  const { t } = useT();
  const role = useSessionStore((s) => s.session?.user.role ?? "client");
  const create = useCreateTicket();

  const send = () => {
    toast(t("profile.deleteAccountDone"), "ok");
    create.mutate({ message: t("admSec.delMessage"), category: "account", urgent: false, topicPicked: true, turns: [], aiSessionId: "", role, path: "/profile" });
  };

  const ask = () =>
    confirmDialog({
      title: t("profile.deleteAccountTitle"),
      message: t("profile.deleteAccountText"),
      confirmLabel: t("profile.deleteAccountYes"),
      cancelLabel: t("profile.deleteAccountNo"),
      icon: "trash-2",
      danger: true,
      onConfirm: send,
    });

  return (
    <PressableScale onPress={ask} scale={0.98} accessibilityRole="button" accessibilityLabel={t("profile.deleteAccount")} style={s.btn}>
      <Icon name="trash-2" size={19} color={RED} />
      <Text variant="body" weight="bold" style={{ color: RED }}>{t("profile.deleteAccount")}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: { width: "100%", minHeight: 54, marginTop: 10, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(239,68,68,0.10)" },
});
