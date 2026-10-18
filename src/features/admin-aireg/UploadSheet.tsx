import { useState } from "react";
import { catChoiceOf, catValue, latestVersion, nextVersion, useUploadReglament, type Reglament } from "@/entities/admin-aireg";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { Button, Text, toast } from "@/shared/ui";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useDirtyClose } from "@/shared/lib/useDirtyClose";
import { VersionField } from "./VersionField";
import { useT } from "@/shared/i18n";
import { CategoryField } from "./CategoryField";
import { UPLOAD_EMPTY, uploadSchema } from "./uploadSchema";
import { pickReglamentFile, titleFromFile, type PickedReglamentFile } from "./pickReglamentFile";

// Upload a .docx / .doc / .pdf: the backend extracts the text and saves it as a reglament (or a new version of one).
export function UploadSheet({ visible, reglaments, onClose, onDone }: { visible: boolean; reglaments: Reglament[]; onClose: () => void; onDone: () => void }) {
  const { t } = useT();
  const up = useUploadReglament();
  const [file, setFile] = useState<PickedReglamentFile | null>(null);
  const [err, setErr] = useState("");
  const [target, setTarget] = useState("");
  const tr = useFieldError();
  const base = reglaments.find((r) => r.id === target);
  const current = base ? latestVersion(base) : "";
  const f = useAppForm(uploadSchema(current), UPLOAD_EMPTY);
  useSheetReset(visible, () => { setFile(null); setErr(""); setTarget(""); f.reset(UPLOAD_EMPTY); });
  const vp = f.formState.errors.version?.message;
  const close = useDirtyClose(visible && (!!file || !!f.watch("title").trim()), onClose);
  const pick = async () => {
    const r = await pickReglamentFile();
    if (!r) return;
    setErr(r.error ? t(`admAiRegC.up.${r.error}`) : "");
    if (r.file) { setFile(r.file); if (!f.getValues("title").trim() && !target) f.setValue("title", titleFromFile(r.file.name).slice(0, 200)); }
  };
  const chooseTarget = (id: string) => {
    setTarget(id);
    const r = reglaments.find((x) => x.id === id);
    if (r) f.reset({ title: r.title, ...catChoiceOf(r.category), version: nextVersion(latestVersion(r) || "1.0") });
    else f.setValue("version", "1.0");
  };
  const submit = f.handleSubmit(async (v) => {
    if (!file) return setErr(t("admAiRegC.up.needFile"));
    try {
      const res = await up.mutateAsync({ title: v.title, category: catValue(v.choice, v.custom), version: v.version.trim(), file });
      if (res.kind === "missing") return toast(t("adm.unavailable"), "err");
      toast(t("admAiRegC.up.done", { title: v.title, v: v.version.trim() }), "ok");
      onDone();
    } catch {
      // the mutation already showed the server's message
    }
  });
  return (
    <FormSheet visible={visible} onClose={close} title={t("admAiRegC.up.title")} subtitle={t("admAiRegC.up.lead")} submitLabel={t("admAiRegC.up.submit")} onSubmit={() => void submit()} submitting={up.isPending}>
      <Button title={file ? file.name : t("admAiRegC.up.choose")} icon={file ? "file" : "upload"} variant={file ? "soft" : "line"} full onPress={() => void pick()} />
      <Text variant="caption" tone={err ? "err" : "gray2"}>{err || t("admAiRegC.up.rules")}</Text>
      {reglaments.some((r) => r.id) ? <SelectField label={t("admAiRegC.up.target")} value={target} options={[{ value: "", label: t("admAiRegB.targetNew") }, ...reglaments.filter((r) => r.id).map((r) => ({ value: r.id, label: r.version ? `${r.title} · v${r.version}` : r.title }))]} onChange={chooseTarget} /> : null}
      <FormInput control={f.control} name="title" label={t("adm.title")} format={(v) => v.slice(0, 200)} placeholder={t("admAiRegB.titlePh")} />
      <CategoryField choice={f.watch("choice")} custom={f.watch("custom")} error={tr(f.formState.errors.custom?.message)} onChoice={(v) => f.setValue("choice", v)} onCustom={(v) => f.setValue("custom", v, { shouldValidate: true })} />
      <VersionField value={f.watch("version")} onChange={(v) => f.setValue("version", v, { shouldValidate: true })} current={current} error={vp ? (vp === "low" ? t("admAiRegB.errVersionLow", { v: current }) : t("admAiRegB.errVersion")) : undefined} />
    </FormSheet>
  );
}
