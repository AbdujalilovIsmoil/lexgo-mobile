import { StyleSheet, View } from "react-native";
import { useSubmitOnboarding, type OnbState, type Readiness } from "@/entities/pro-onboarding";
import { Button, Icon, Text, confirmDialog } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { state: OnbState; ready: Readiness };

// "Send for review" (POST /seller-onboarding/submit). Short primary button, disabled with a one-line reason until the
// required steps are done; while the review runs it only informs. The server answers 422 if steps are missing (toast).
export function SubmitFooter({ state, ready }: Props) {
  const { t } = useT();
  const c = useColors();
  const submit = useSubmitOnboarding();
  if (ready.mode === "hidden") return null;
  if (ready.mode === "waiting") {
    return (
      <View style={s.wait} accessibilityRole="text" accessibilityLabel={t("sl3.submit.waiting")}>
        <Icon name="clock" size={18} color={c.accent} />
        <Text variant="small" weight="semibold" style={s.flex} numberOfLines={2}>{t("onbUx.waitBar")}</Text>
      </View>
    );
  }
  const ask = () =>
    confirmDialog({
      title: t("sl3.submit.title"),
      message: t("sl3.submit.text"),
      confirmLabel: t("onbUx.submit"),
      cancelLabel: t("adm.cancel"),
      icon: "send",
      onConfirm: async () => {
        await submit.mutateAsync().catch(() => undefined); // the failure is already a toast
      },
    });
  return (
    <View style={s.col}>
      {ready.mode === "blocked" && ready.missing > 0 ? (
        <Text variant="caption" tone="gray" center numberOfLines={1}>{t("onbUx.missing", { n: ready.missing })}</Text>
      ) : ready.mode === "ready" ? (
        <Text variant="caption" tone="ok" center numberOfLines={1}>{t("onbUx.allSet")}</Text>
      ) : null}
      <Button title={t(state === "rejected" ? "onbUx.submitAgain" : "onbUx.submit")} icon="send" full size="lg" loading={submit.isPending} disabled={!ready.canSubmit} onPress={ask} />
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 6 },
  flex: { flex: 1 },
  wait: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44 },
});
