import { View } from "react-native";
import { FormInput } from "@/shared/form";
import { Icon } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { RegisterFormState } from "../model/useRegisterForm";

// First name, last name, patronymic (optional) — the backend stores them separately and composes `name`.
export function NameFields({ f }: { f: RegisterFormState }) {
  const { t } = useT();
  const left = <Icon name="user" size={18} tone="gray" />;
  return (
    <View style={{ gap: 14 }}>
      <FormInput control={f.form.control} name="firstName" label={t("au1.firstName")} placeholder={t("au1.firstNamePh")} autoCapitalize="words" textContentType="givenName" left={left} />
      <FormInput control={f.form.control} name="lastName" label={t("au1.lastName")} placeholder={t("au1.lastNamePh")} autoCapitalize="words" textContentType="familyName" left={left} />
      <FormInput control={f.form.control} name="middleName" label={`${t("au1.middleName")} · ${t("adm.optional")}`} placeholder={t("au1.middleNamePh")} autoCapitalize="words" textContentType="middleName" left={left} />
    </View>
  );
}
