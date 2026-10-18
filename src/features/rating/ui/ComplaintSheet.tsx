import { useEffect, useState } from "react";
import { DESC_MAX, SUBJECT_MAX, findWorkRef, useComplaintTargets, workRefValue, type ComplaintItem } from "@/entities/rating";
import { contactBlocked } from "@/entities/support";
import { FormSheet , Field } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { Card, Icon, Text, toast } from "@/shared/ui";
import { View } from "react-native";
import { useColors } from "@/shared/theme";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { complaintSchema } from "../model/complaintSchema";
import { useFileComplaint } from "../model/useFileComplaint";
import { CategoryCards } from "./CategoryCards";
import { RelatedWorkField } from "./RelatedWorkField";

type Props = { visible: boolean; onClose: () => void; relatedRef?: string; onSent?: (c: ComplaintItem) => void };

// New complaint (web: NewComplaintForm): the work it is about, what happened, subject and detail.
export function ComplaintSheet({ visible, onClose, relatedRef = "", onSent }: Props) {
  const { t } = useT();
  const c = useColors();
  const [work, setWork] = useState(relatedRef);
  const f = useAppForm(complaintSchema, { category: "", subject: "", desc: "" });
  const tr = useFieldError();
  const targets = useComplaintTargets(visible);
  const send = useFileComplaint((c) => { onClose(); if (onSent) onSent(c); else toast(t("pwc.sent"), "ok"); });
  useSheetReset(visible, () => { f.reset({ category: "", subject: "", desc: "" }); setWork(relatedRef); });
  const { reset } = send;
  useEffect(() => { if (visible) reset(); }, [visible, reset]);
  const target = findWorkRef(targets.data ?? [], work);
  const submit = f.handleSubmit((v) => send.mutate({ category: v.category, subject: v.subject, description: v.desc, relatedRef: target ? workRefValue(target) : "" }));
  const blocked = send.error ? contactBlocked(send.error) : null;
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("pwc.new")} submitLabel={t("pwc.submit")} submitting={send.isPending} onSubmit={() => void submit()} secondary={{ label: t("pwc.cancel"), onPress: onClose }}>
      <RelatedWorkField q={targets} value={target ? workRefValue(target) : ""} onChange={setWork} />
      <CategoryCards value={f.watch("category")} onChange={(v) => f.setValue("category", v, { shouldValidate: true })} error={tr(f.formState.errors.category?.message)} />
      <FormInput control={f.control} name="subject" label={t("py5.form.subject")} maxLength={SUBJECT_MAX} placeholder={t("py5.form.subjectPh")} />
      <Field label={t("py5.form.desc")}>
        <Text variant="small" tone="gray" style={{ marginBottom: 8 }}>{t("pwc.form.descHint")}</Text>
        <FormInput control={f.control} name="desc" maxLength={DESC_MAX} multiline numberOfLines={5} placeholder={t("py5.form.descPh")} style={{ minHeight: 120, textAlignVertical: "top" }} />
        <Text variant="caption" tone="gray2" style={{ alignSelf: "flex-end", marginTop: 6 }}>{t("pwc.form.counter", { n: f.watch("desc").length, max: DESC_MAX })}</Text>
      </Field>
      {blocked ? <Card tinted><Text variant="small" tone="err">{t("pwc.contactBlocked")}</Text></Card> : null}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 12, borderRadius: 14, backgroundColor: c.surface2 }}><Icon name="bell" size={16} color={c.accent} /><Text variant="small" tone="gray" style={{ flex: 1 }}>{t("pwc.form.reassure")}</Text></View>
    </FormSheet>
  );
}
