import { useState } from "react";
import { Button, Segmented, Text, toast } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { PickedFile } from "@/entities/admin-templates";
import { pickImportFile, slugOf, type ImportMode } from "../model/pickImportFile";
import { digitsOnly, importSchema, slugify } from "../model/templateSchema";
import { useImportFlow } from "../model/useImportFlow";
import { ImportResult } from "./ImportResult";

const CATS = ["contract", "claim", "application", "power_of_attorney", "corporate", "other"];

// Import one DOCX (fields are detected and previewed) or a ZIP of many DOCX files; the templates land inactive as drafts.
export function TemplateImportSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const [mode, setMode] = useState<ImportMode>("docx");
  const [file, setFile] = useState<PickedFile | null>(null);
  const f = useAppForm(importSchema(mode), { title: "", slug: "", price: "" });
  const [category, setCategory] = useState("contract");
  const [language, setLanguage] = useState("uz-latn");
  const [visibility, setVisibility] = useState("clients");
  const flow = useImportFlow();
  const switchMode = (m: ImportMode) => { setMode(m); setFile(null); flow.clear(); };
  const pick = async () => {
    const r = await pickImportFile(mode);
    if (r === "badType") return toast(t(mode === "zip" ? "admTplB.onlyZip" : "admTplB.onlyDocx"), "err");
    if (!r) return;
    setFile(r);
    flow.clear();
    if (!f.getValues("title")) f.setValue("title", r.name.replace(/\.(docx|zip)$/i, ""));
    if (!f.getValues("slug")) f.setValue("slug", slugOf(r.name));
  };
  const submit = f.handleSubmit((v) => file && flow.run.mutate({ mode, file, meta: { category, language, visibility, slug: v.slug, title: v.title, price: parseInt(v.price, 10) || 0 } }));
  const opts = (xs: string[], ns: string) => xs.map((x) => ({ value: x, label: t(`admTpl.${ns}.${x}`) }));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admTpl.importTitle")} onSubmit={() => void submit()} submitLabel={t("admTplB.upload")} submitting={flow.run.isPending} disabled={!file} snaps={[0.85, 0.96]}>
      <Text variant="small" tone="gray">{t("admTpl.importLead")}</Text>
      <Segmented options={[{ value: "docx", label: t("admTpl.modeDocx") }, { value: "zip", label: t("admTpl.modeZip") }]} value={mode} onChange={switchMode} />
      <Button title={file ? file.name : t(mode === "zip" ? "admTpl.pickZip" : "admTpl.pickDocx")} icon="upload" variant="line" onPress={() => void pick()} />
      <Text variant="caption" tone="gray2">{t(mode === "zip" ? "admTpl.zipHint" : "admTpl.docxHint")}</Text>
      {mode === "docx" ? <><FormInput control={f.control} name="title" label={t("adm.title")} /><FormInput control={f.control} name="slug" label={t("admTpl.slug")} format={slugify} autoCapitalize="none" /></> : null}
      <SelectField label={t("admTpl.section")} value={category} options={opts(CATS, "cats")} onChange={setCategory} />
      <SelectField label={t("admTpl.language")} value={language} options={opts(["uz-latn", "uz-cyrl", "ru"], "langs")} onChange={setLanguage} />
      <SelectField label={t("admTpl.visibility")} value={visibility} options={opts(["staff", "clients", "public"], "vis")} onChange={setVisibility} />
      {mode === "docx" ? <FormInput control={f.control} name="price" label={t("admTpl.importPrice")} format={digitsOnly} keyboardType="number-pad" placeholder="0" /> : null}
      {flow.outcome ? <ImportResult outcome={flow.outcome} /> : null}
    </FormSheet>
  );
}
