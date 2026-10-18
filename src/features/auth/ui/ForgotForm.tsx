import { StyleSheet, View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtWait } from "../lib/fmtWait";
import { useForgot } from "../model/useForgot";
import { FormPhone } from "./FormFields";

export function ForgotForm() {
  const { t } = useT();
  const f = useForgot();
  const title = f.wait > 0 ? t("au2.retryIn", { time: fmtWait(f.wait) }) : f.busy ? t("auth.sending") : t("auth.sendCode");
  return (
    <View style={s.form}>
      <FormPhone control={f.control} name="phone" autoFocus />
      {f.error ? (
        <Text variant="small" tone="err" center>
          {f.error}
        </Text>
      ) : null}
      <Button title={title} onPress={() => void f.submit()} loading={f.busy} disabled={f.wait > 0} variant="gradient" size="lg" full icon="send" />
      <Text variant="caption" tone="gray2" center>
        {t("au3.forgotNote")}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  form: { gap: 14 },
});
