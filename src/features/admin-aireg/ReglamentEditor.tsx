import { useState } from "react";
import { View } from "react-native";
import { catValue, CATEGORIES, resolveReglament, useSaveReglament, type Gap, type Reglament } from "@/entities/admin-aireg";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useFieldError } from "@/shared/form";
import { Text, toast } from "@/shared/ui";
import { useKept } from "@/shared/lib/useKept";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useDirtyClose } from "@/shared/lib/useDirtyClose";
import { useT } from "@/shared/i18n";
import { CategoryField } from "./CategoryField";
import { extraOf, seedFrom, seedNew, type Form } from "./editorSeed";
import { useEditorForm } from "./useEditorForm";
import { StatusField } from "./StatusField";
import { VersionField } from "./VersionField";
export type EditorMode = { kind: "create"; title?: string; category?: string; version?: string } | { kind: "edit"; reglament: Reglament } | { kind: "gap"; gap: Gap };

const initial = (m: EditorMode, block: string): Form => (m.kind === "edit" ? seedFrom(m.reglament, "") : m.kind === "gap" ? seedNew(block, CATEGORIES.includes(m.gap.category) ? m.gap.category : "support") : seedNew("", m.category || "support", m.title, m.version));
const qa = (t: (k: string) => string, g: Gap) => `${t("admAiRegB.qLabel")}: ${g.question.trim()}\n${t("admAiRegB.aLabel")}: `;

// Create a reglament, write a new version of one, or answer an unanswered question: the text is saved as a new version
// and the old ones stay. Same validation as the web editor; leaving with unsaved text asks first.
export function ReglamentEditor({ mode, reglaments, onClose, onSaved }: { mode: EditorMode | null; reglaments: Reglament[]; onClose: () => void; onSaved: (gapKey: string) => void }) {
  const { t } = useT();
  const m = useKept(mode);
  const save = useSaveReglament();
  const gap = m?.kind === "gap" ? m.gap : null;
  const tr = useFieldError();
  const { f, base, current, load } = useEditorForm();
  const [start, setStart] = useState("");
  const v = f.watch();
  const err = f.formState.errors;
  useSheetReset(!!mode, () => { if (mode) setStart(load(initial(mode, mode.kind === "gap" ? qa(t, mode.gap) : ""))); });
  const close = useDirtyClose(!!mode && JSON.stringify(v) !== start, onClose);
  const pickTarget = async (id: string) => {
    const extra = extraOf({ ...f.getValues(), base });
    const r = reglaments.find((x) => x.id === id);
    load(r ? seedFrom(await resolveReglament(r), extra) : seedNew(extra, gap && CATEGORIES.includes(gap.category) ? gap.category : "support"));
  };
  const submit = f.handleSubmit(async (x) => {
    const input = { title: x.title, category: catValue(x.choice, x.custom), version: x.version.trim(), content: x.content, status: x.status };
    const id = m?.kind === "edit" ? m.reglament.id : x.target;
    try {
      const res = await save.mutateAsync({ id: id || undefined, input });
      if (res.kind === "missing") return toast(t("adm.unavailable"), "err");
      toast(id ? t("admAiRegB.updatedV", { v: input.version }) : t("admAiRegB.created", { title: input.title }), "ok");
      onSaved(gap?.key ?? "");
    } catch {
      // the mutation already showed the server's message
    }
  });
  const title = m?.kind === "edit" ? t("admAiRegB.editTitle") : m?.kind === "gap" ? t("admAiRegB.gapTitle") : t("admAiRegB.createTitle");
  const words = v.content.trim() ? v.content.trim().split(/\s+/).length : 0;
  const versioned = !!v.target || m?.kind === "edit";
  const verr = err.version?.message ? (err.version.message === "low" ? t("admAiRegB.errVersionLow", { v: current }) : t("admAiRegB.errVersion")) : undefined;
  return (
    <FormSheet visible={!!mode} onClose={close} title={title} onSubmit={() => void submit()} submitting={save.isPending} submitLabel={versioned ? t("admAiRegB.saveVersion") : t("adm.save")} snaps={[0.85, 0.96]}>
      {gap ? <View style={{ gap: 4 }}><Text variant="caption" tone="gray">{t("admAiRegB.gapLabel")}</Text><Text variant="body" weight="semibold">{gap.question}</Text></View> : null}
      {gap && reglaments.some((r) => r.id) ? <SelectField label={t("admAiRegB.target")} value={v.target} options={[{ value: "", label: t("admAiRegB.targetNew") }, ...reglaments.filter((r) => r.id).map((r) => ({ value: r.id, label: r.version ? `${r.title} · v${r.version}` : r.title }))]} onChange={(v) => void pickTarget(v)} /> : null}
      <FormInput control={f.control} name="title" label={t("adm.title")} format={(x) => x.slice(0, 200)} placeholder={t("admAiRegB.titlePh")} />
      <CategoryField choice={v.choice} custom={v.custom} error={tr(err.custom?.message)} onChoice={(x) => f.setValue("choice", x)} onCustom={(x) => f.setValue("custom", x, { shouldValidate: true })} />
      <VersionField value={v.version} onChange={(x) => f.setValue("version", x, { shouldValidate: true })} current={current} error={verr} />
      <StatusField value={v.status} onChange={(x) => f.setValue("status", x)} />
      <FormInput control={f.control} name="content" label={t("admAiRegB.content")} multiline placeholder={t("admAiRegB.contentPh")} hint={t("admAiRegB.count", { chars: v.content.length, words })} style={{ minHeight: 280, textAlignVertical: "top", lineHeight: 22 }} />
      <Text variant="caption" tone="gray2">{versioned ? t("admAiRegB.newVersionNote") : t("admAiRegB.firstVersionNote")}</Text>
    </FormSheet>
  );
}
