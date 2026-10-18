import { useAccount, useSaveAccount, useSaveProfile, LANGUAGE_KEYS, type ProProfile } from "@/entities/pro-profile";
import { FormInput } from "@/shared/form";
import { Field, MultiChips } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { personalSchema } from "./schemas";
import { SectionSheet } from "./SectionSheet";
import { useSectionForm } from "./useSectionForm";

type Props = { visible: boolean; onClose: () => void; userId: string; profile: ProProfile };

// Personal data: name and e-mail (account record) and the languages clients can use (profile).
export function PersonalSheet({ visible, onClose, userId, profile }: Props) {
  const { t } = useT();
  const account = useAccount().data;
  const { f, ...sec } = useSectionForm(userId, "personal", personalSchema, { name: account?.name ?? "", email: account?.email ?? "", languages: profile.languages }, visible);
  const saveAcc = useSaveAccount();
  const saveProf = useSaveProfile();
  const options = [...new Set([...LANGUAGE_KEYS, ...profile.languages])].map((k) => ({ value: k, label: t(`sl5.lang.${k}`).startsWith("sl5.") ? k : t(`sl5.lang.${k}`) }));
  const submit = f.handleSubmit(async (v) => {
    try {
      await saveAcc.mutateAsync({ name: v.name, email: v.email });
      await saveProf.mutateAsync({ cur: profile, patch: { languages: v.languages } });
      sec.done();
      onClose();
    } catch {
      /* the failing call already showed the server's message */
    }
  });
  return (
    <SectionSheet visible={visible} onClose={onClose} title={t("sl4.personal.title")} restored={sec.restored} discard={sec.discard} onSubmit={() => void submit()} submitting={saveAcc.isPending || saveProf.isPending}>
      <FormInput control={f.control} name="name" label={t("sl4.f.name")} autoCapitalize="words" />
      <FormInput control={f.control} name="email" label={t("sl4.f.email")} keyboardType="email-address" autoCapitalize="none" />
      <Field label={t("sl4.f.languages")}>
        <MultiChips options={options} value={f.watch("languages")} onChange={(v) => f.setValue("languages", v, { shouldDirty: true })} />
      </Field>
    </SectionSheet>
  );
}
