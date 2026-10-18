import { CASE_STATUSES, useArchiveCase, useCreateCase, useUpdateCase, type ProCase } from "@/entities/pro-cases";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { tOr } from "@/shared/lib/pro/tOr";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { FormDate, FormInput, useAppForm } from "@/shared/form";
import { confirmDialog } from "@/shared/ui";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { bodyOf, draftOf } from "../model/draft";
import { caseSchema } from "../model/caseSchema";

type Props = { visible: boolean; onClose: () => void; item: ProCase | null };

// Open a new case or manage one (status, stage, next step, deadline); archive from the secondary button.
export function CaseFormSheet({ visible, onClose, item }: Props) {
  const { t } = useT();
  const me = useSession()?.user.id;
  const f = useAppForm(caseSchema, draftOf(item));
  useSheetReset(visible, () => f.reset(draftOf(item)));
  const create = useCreateCase();
  const update = useUpdateCase();
  const archive = useArchiveCase();
  const submit = f.handleSubmit((v) => {
    const body = bodyOf(v, !!item);
    if (!item) return create.mutate({ ...body, lawyer_user_id: me }, { onSuccess: onClose });
    update.mutate({ id: item.id, ...body }, { onSuccess: onClose });
  });
  const askArchive = () => item && confirmDialog({ title: t("aw4.archiveTitle"), message: t("aw4.archiveText"), confirmLabel: t("aw4.archive"), cancelLabel: t("adm.cancel"), icon: "archive", danger: true, onConfirm: () => archive.mutate(item.id, { onSuccess: onClose }) });
  return (
    <FormSheet visible={visible} onClose={onClose} title={item ? t("aw4.manage") : t("aw4.add")} subtitle={item?.number} onSubmit={() => void submit()} submitting={create.isPending || update.isPending} secondary={item && item.status !== "archived" ? { label: t("aw4.archive"), onPress: askArchive } : undefined}>
      <FormInput control={f.control} name="title" label={t("aw4.fTitle")} placeholder={t("aw4.fTitlePh")} maxLength={200} />
      <SelectField label={t("aw4.fStatus")} value={f.watch("status")} onChange={(x) => f.setValue("status", x)} options={CASE_STATUSES.map((s) => ({ value: s, label: tOr(t, `aw11.caseStatus.${s}`, s) }))} />
      <FormInput control={f.control} name="stage" label={t("aw4.fStage")} placeholder={t("aw4.fStagePh")} />
      <FormInput control={f.control} name="next" label={t("aw4.fNext")} placeholder={t("aw4.fNextPh")} />
      <FormDate control={f.control} name="deadline" label={t("aw4.deadline")} clearable />
      <FormInput control={f.control} name="type" label={t("aw4.fType")} placeholder={t("aw4.fTypePh")} autoCapitalize="none" />
      <FormInput control={f.control} name="desc" label={t("aw4.fDesc")} multiline style={{ minHeight: 70, textAlignVertical: "top" }} />
    </FormSheet>
  );
}
