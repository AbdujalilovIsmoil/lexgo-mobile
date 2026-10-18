import { REGION_KEYS, regionKeyOf, useSaveProfile, type ProProfile } from "@/entities/pro-profile";
import { FormInput, useFieldError } from "@/shared/form";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { regionSchema } from "./schemas";
import { SectionSheet } from "./SectionSheet";
import { useSectionForm } from "./useSectionForm";

type Props = { visible: boolean; onClose: () => void; userId: string; profile: ProProfile };

// Region and district; the region decides the price corridor (TZ 19), so it is a fixed list of backend keys.
export function RegionSheet({ visible, onClose, userId, profile: p }: Props) {
  const { t } = useT();
  const tr = useFieldError();
  const { f, ...sec } = useSectionForm(userId, "region", regionSchema, { region: regionKeyOf(p.region), district: p.district }, visible);
  const save = useSaveProfile(() => {
    sec.done();
    onClose();
  });
  const submit = f.handleSubmit((v) => save.mutate({ cur: p, patch: v }));
  const region = f.watch("region");
  const options = REGION_KEYS.map((k) => ({ value: k as string, label: t(`lawyers.regions.${k}`) }));
  if (region && !options.some((o) => o.value === region)) options.push({ value: region, label: region });
  return (
    <SectionSheet visible={visible} onClose={onClose} title={t("sl4.region.title")} restored={sec.restored} discard={sec.discard} onSubmit={() => void submit()} submitting={save.isPending}>
      <SelectField label={t("sl4.f.region")} value={region} options={options} onChange={(v) => f.setValue("region", v, { shouldValidate: true })} placeholder={t("sl4.f.regionPh")} error={tr(f.formState.errors.region?.message)} />
      <FormInput control={f.control} name="district" label={t("sl4.f.district")} placeholder={t("sl4.f.districtPh")} />
    </SectionSheet>
  );
}
