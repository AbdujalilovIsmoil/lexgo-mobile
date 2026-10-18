import { View } from "react-native";
import { FormInput, useAppForm } from "@/shared/form";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { identitySchema } from "./identitySchema";

type Props = { provider: string; busy: boolean; wait: number; note: { ok: boolean; msg: string } | null; onVerify: (code: string) => void; onCancel: () => void };

// Demo-provider step: type the verification code.
export function IdentityCode({ provider, busy, wait, note, onVerify, onCancel }: Props) {
  const { t } = useT();
  const f = useAppForm(identitySchema, { code: "" });
  return (
    <View style={{ gap: 10 }}>
      <Text variant="small" tone="gray">{t("cpr.idCodeHint", { provider: provider === "myid" ? "MyID" : "OneID" })}</Text>
      <FormInput control={f.control} name="code" label={t("cpr.idCode")} format={(v) => v.replace(/\D/g, "")} maxLength={10} keyboardType="number-pad" textContentType="oneTimeCode" />
      {note ? <Text variant="small" tone={note.ok ? "ok" : "err"}>{note.msg}</Text> : null}
      <Button title={busy ? t("cpr.idVerifying") : t("cpr.idVerify")} variant="gradient" full disabled={busy || wait > 0} onPress={() => void f.handleSubmit((v) => onVerify(v.code))()} />
      <Button title={t("cpr.idCancel")} variant="line" full onPress={onCancel} />
    </View>
  );
}
