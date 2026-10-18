import { useMemo } from "react";
import { STRUCTURE_KEYS, isAdvocate, useSaveProfile, type ProProfile } from "@/entities/pro-profile";
import { FormInput } from "@/shared/form";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { licenseSchema } from "./schemas";
import { SectionSheet } from "./SectionSheet";
import { useSectionForm } from "./useSectionForm";

type Props = { visible: boolean; onClose: () => void; userId: string; profile: ProProfile };

// Licence / diploma data and the organization an advocate belongs to (documents are uploaded on the onboarding screen).
export function LicenseSheet({ visible, onClose, userId, profile: p }: Props) {
  const { t } = useT();
  const adv = isAdvocate(p.sellerType);
  const schema = useMemo(() => licenseSchema(adv), [adv]);
  const init = { licenseNumber: p.licenseNumber, barAssociation: p.barAssociation, advocateStructure: p.advocateStructure, organizationName: p.organizationName, education: p.education };
  const { f, ...sec } = useSectionForm(userId, "license", schema, init, visible);
  const save = useSaveProfile(() => {
    sec.done();
    onClose();
  });
  const submit = f.handleSubmit((v) => save.mutate({ cur: p, patch: v }));
  return (
    <SectionSheet visible={visible} onClose={onClose} title={t("sl4.license.title")} restored={sec.restored} discard={sec.discard} onSubmit={() => void submit()} submitting={save.isPending}>
      {adv ? (
        <>
          <FormInput control={f.control} name="licenseNumber" label={t("sl4.f.license")} autoCapitalize="characters" placeholder="ADV-2015-4821" />
          <FormInput control={f.control} name="barAssociation" label={t("sl4.f.bar")} />
          <SelectField label={t("sl4.f.structure")} value={f.watch("advocateStructure")} options={STRUCTURE_KEYS.map((k) => ({ value: k, label: t(`sl5.structure.${k}`) }))} onChange={(v) => f.setValue("advocateStructure", v, { shouldDirty: true })} />
        </>
      ) : null}
      <FormInput control={f.control} name="organizationName" label={t("sl4.f.organization")} />
      <FormInput control={f.control} name="education" label={t("sl4.f.education")} multiline hint={t("sl4.h.education")} />
    </SectionSheet>
  );
}
