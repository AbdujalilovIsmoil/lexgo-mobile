import { useCreateCourse, type CourseInput, type CourseLevel } from "@/entities/admin-academy";
import { FormSheet, SelectField, SwitchField } from "@/shared/ui/admin";
import { FormInput, useAppForm } from "@/shared/form";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { COURSE_EMPTY, courseSchema, digitsOnly } from "./courseSchema";

const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];
const num = (s: string) => Number(s.replace(/\D/g, "")) || 0;

// New academy course (POST /academy/courses, academy.manage). Saved as a draft unless "publish" is on; courses cannot be edited afterwards.
export function CourseFormSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const f = useAppForm(courseSchema, COURSE_EMPTY);
  useSheetReset(visible, () => f.reset(COURSE_EMPTY));
  const create = useCreateCourse();
  const submit = f.handleSubmit((v) => {
    const body: CourseInput = { title: v.title, category: v.category || "business", level: v.level, lessons: num(v.lessons), minutes: num(v.minutes), price: num(v.price), status: v.publish ? "active" : "draft", cover: v.cover };
    create.mutate(body, { onSuccess: onClose });
  });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ag6.course.new")} subtitle={t("ag6.course.hint")} onSubmit={() => void submit()} submitLabel={t("adm.create")} submitting={create.isPending}>
      <FormInput control={f.control} name="title" label={t("adm.title")} />
      <FormInput control={f.control} name="category" label={t("ag6.course.category")} format={(x) => x.toLowerCase().replace(/[^a-z0-9_]/g, "")} autoCapitalize="none" />
      <SelectField label={t("ag6.course.level")} value={f.watch("level")} onChange={(x) => f.setValue("level", x)} options={LEVELS.map((l) => ({ value: l, label: t(`ag6.course.levels.${l}`) }))} />
      <FormInput control={f.control} name="lessons" label={t("ag6.course.lessonsLabel")} format={digitsOnly} keyboardType="number-pad" />
      <FormInput control={f.control} name="minutes" label={t("ag6.course.minutesLabel")} format={digitsOnly} keyboardType="number-pad" />
      <FormInput control={f.control} name="price" label={t("adm.price")} format={digitsOnly} keyboardType="number-pad" hint={t("ag6.course.priceHint")} />
      <FormInput control={f.control} name="cover" label={t("ag6.course.cover")} autoCapitalize="none" keyboardType="url" />
      <SwitchField label={t("ag6.course.publish")} hint={t("ag6.course.publishHint")} value={f.watch("publish")} onChange={(x) => f.setValue("publish", x)} />
    </FormSheet>
  );
}
