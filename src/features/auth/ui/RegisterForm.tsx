import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller } from "react-hook-form";
import { FormInput, useFieldError } from "@/shared/form";
import { Button, Icon, PressableScale, Text } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtWait } from "../lib/fmtWait";
import { REGIONS } from "../model/registerRoles";
import { useRegister } from "../model/useRegister";
import { ConsentRow } from "./ConsentRow";
import { NameFields } from "./NameFields";
import { FormPassword, FormPhone } from "./FormFields";
import { RoleTiles } from "./RoleTiles";
import { lxCodeFrom } from "@/shared/lib/pasted";

// Sign-up for every account kind: kind → names → region → phone → password → referral → documents.
export function RegisterForm({ referral, role }: { referral?: string; role?: string }) {
  const { t } = useT();
  const router = useRouter();
  const f = useRegister(referral, role);
  const tr = useFieldError();
  const c = f.form.control;
  const title = f.wait > 0 ? t("au2.retryIn", { time: fmtWait(f.wait) }) : f.busy ? t("auth.sending") : t("auth.sendCode");
  return (
    <View style={s.form}>
      <Controller control={c} name="role" render={({ field }) => <RoleTiles value={field.value} onChange={field.onChange} />} />
      <NameFields f={f} />
      <Controller control={c} name="region" render={({ field, fieldState }) => <SelectField label={t("au1.region")} placeholder={t("au1.regionPh")} value={field.value} options={REGIONS.map((r) => ({ value: r, label: t(`lawyers.regions.${r}`) }))} onChange={field.onChange} error={tr(fieldState.error?.message)} />} />
      <FormPhone control={c} name="phone" />
      <FormPassword control={c} name="password" hint={t("auth.passwordHint")} newPassword />
      <FormInput control={c} name="code" format={lxCodeFrom} label={`${t("au1.referral")} · ${t("adm.optional")}`} placeholder="LX…" autoCapitalize="characters" autoCorrect={false} left={<Icon name="gift" size={18} tone="gray" />} />
      <Controller control={c} name="agreed" render={({ field, fieldState }) => <ConsentRow value={field.value} onChange={field.onChange} docs={f.docs} error={tr(fieldState.error?.message)} />} />
      {f.serverError ? <Text variant="small" tone="err" center>{f.serverError}</Text> : null}
      {f.exists ? <Button title={t("au1.goLogin")} onPress={() => router.replace("/auth/login")} variant="soft" full icon="log-in" /> : null}
      <Button title={title} onPress={() => void f.submit()} loading={f.busy} disabled={f.wait > 0} variant="gradient" size="lg" full icon="send" />
      <View style={s.switch}>
        <Text variant="small" tone="gray">{t("auth.haveAccount")}</Text>
        <PressableScale haptic={false} onPress={() => router.replace("/auth/login")} hitSlop={6}>
          <Text variant="small" tone="accent" weight="bold">{t("auth.submit")}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  form: { gap: 14 },
  switch: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
});
