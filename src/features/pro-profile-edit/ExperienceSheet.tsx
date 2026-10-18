import { isAdvocate, useSaveProfile, type ProProfile } from "@/entities/pro-profile";
import { FormInput } from "@/shared/form";
import { useT } from "@/shared/i18n";
import { digitsMax } from "./numFormat";
import { experienceSchema } from "./schemas";
import { SectionSheet } from "./SectionSheet";
import { useSectionForm } from "./useSectionForm";

type Props = { visible: boolean; onClose: () => void; userId: string; profile: ProProfile };
const str = (n: number) => (n ? String(n) : "");
const years = digitsMax(70);
const count = digitsMax();

// Years of practice, case statistics (the server derives the success rate) and the hourly price.
export function ExperienceSheet({ visible, onClose, userId, profile: p }: Props) {
  const { t } = useT();
  const adv = isAdvocate(p.sellerType);
  const init = { experienceYears: str(p.experienceYears), lawyerExperienceYears: str(p.lawyerExperienceYears), totalCases: str(p.totalCases), winsCount: str(p.winsCount), partialWinsCount: str(p.partialWinsCount), hourlyPrice: str(p.hourlyPrice) };
  const { f, ...sec } = useSectionForm(userId, "experience", experienceSchema, init, visible);
  const save = useSaveProfile(() => {
    sec.done();
    onClose();
  });
  const submit = f.handleSubmit((s) => {
    const v = { experienceYears: Number(s.experienceYears), lawyerExperienceYears: Number(s.lawyerExperienceYears), totalCases: Number(s.totalCases), winsCount: Number(s.winsCount), partialWinsCount: Number(s.partialWinsCount), hourlyPrice: Number(s.hourlyPrice) };
    // A yurist has no separate advocate years: one number feeds both fields (as on the web).
    save.mutate({ cur: p, patch: adv ? v : { ...v, experienceYears: v.lawyerExperienceYears } });
  });
  const num = { keyboardType: "number-pad", placeholder: "0" } as const;
  return (
    <SectionSheet visible={visible} onClose={onClose} title={t("sl4.experience.title")} restored={sec.restored} discard={sec.discard} onSubmit={() => void submit()} submitting={save.isPending}>
      {adv ? <FormInput control={f.control} name="experienceYears" label={t("sl4.f.advYears")} format={years} {...num} /> : null}
      <FormInput control={f.control} name="lawyerExperienceYears" label={t(adv ? "sl4.f.lawYears" : "sl4.f.years")} format={years} {...num} />
      <FormInput control={f.control} name="totalCases" label={t("sl4.f.totalCases")} format={count} {...num} />
      <FormInput control={f.control} name="winsCount" label={t("sl4.f.wins")} format={count} {...num} />
      <FormInput control={f.control} name="partialWinsCount" label={t("sl4.f.partial")} format={count} {...num} />
      <FormInput control={f.control} name="hourlyPrice" label={t("sl4.f.hourly")} format={count} hint={t("sl4.h.hourly")} {...num} />
    </SectionSheet>
  );
}
