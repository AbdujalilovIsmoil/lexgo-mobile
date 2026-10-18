import { ADVOCATE_ONLY_DIRECTIONS, DIRECTION_KEYS, isAdvocate, useSaveProfile, type ProProfile } from "@/entities/pro-profile";
import { FormInput } from "@/shared/form";
import { Field, MultiChips } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { directionsSchema } from "./schemas";
import { SectionSheet } from "./SectionSheet";
import { useSectionForm } from "./useSectionForm";

type Props = { visible: boolean; onClose: () => void; userId: string; profile: ProProfile };
const BIO_MAX = 1000;

// Practice areas (a yurist cannot offer the advocate-only ones) and the short "about me" clients read.
export function DirectionsSheet({ visible, onClose, userId, profile: p }: Props) {
  const { t } = useT();
  const { f, ...sec } = useSectionForm(userId, "directions", directionsSchema, { specializations: p.specializations, bio: p.bio }, visible);
  const save = useSaveProfile(() => {
    sec.done();
    onClose();
  });
  const submit = f.handleSubmit((v) => save.mutate({ cur: p, patch: v }));
  const known = DIRECTION_KEYS.filter((k) => isAdvocate(p.sellerType) || !ADVOCATE_ONLY_DIRECTIONS.includes(k));
  const label = (k: string) => (t(`sl5.dir.${k}`).startsWith("sl5.") ? humanizeSlug(k) : t(`sl5.dir.${k}`));
  const options = [...new Set([...known, ...p.specializations])].map((k) => ({ value: k, label: label(k) }));
  return (
    <SectionSheet visible={visible} onClose={onClose} title={t("sl4.directions.title")} restored={sec.restored} discard={sec.discard} onSubmit={() => void submit()} submitting={save.isPending}>
      <Field label={t("sl4.f.directions")} hint={t("sl4.h.directions")}>
        <MultiChips options={options} value={f.watch("specializations")} onChange={(v) => f.setValue("specializations", v, { shouldDirty: true })} />
      </Field>
      <FormInput control={f.control} name="bio" label={t("sl4.f.bio")} multiline maxLength={BIO_MAX} hint={`${f.watch("bio").length}/${BIO_MAX}`} placeholder={t("sl4.h.bio")} />
    </SectionSheet>
  );
}
