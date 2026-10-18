import { View } from "react-native";
import { Segmented } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { SchemaFields } from "../form/SchemaFields";
import type { EditorEntry, EditorProps, Errors } from "../form/types";
import { recList, str } from "../form/values";
import { FieldRows } from "./FieldRows";
import { FileBox } from "./FileBox";
import { K06Clauses } from "./K06Clauses";
import { K06Template } from "./K06Template";
import { fieldNames, fieldRowsOf, validateFieldRows } from "./rowsLogic";

const HANDLED = ["mode", "fields", "template_text", "clauses", "source_file_required"];
const modeOf = (p: Dict): "editor" | "upload" => (str(p.mode).toLowerCase() === "upload" ? "upload" : "editor");
const clausesOf = (v: unknown): Dict[] => recList(v).map((c) => ({ ...c, title: str(c.title ?? c.name), text: str(c.text ?? c.body ?? c.content) }));

function validateK06(payload: Dict): Errors {
  const out: Errors = {};
  if (!str(payload.title).trim()) out.title = "@required";
  if (modeOf(payload) === "editor" && !str(payload.template_text).trim() && !clausesOf(payload.clauses).length) out.template_text = "@required";
  validateFieldRows(recList(payload.fields), "fields", new Map(), out);
  clausesOf(payload.clauses).forEach((c, i) => {
    if (!str(c.title).trim()) out[`clauses.${i}.title`] = "@required";
    if (!str(c.text).trim()) out[`clauses.${i}.text`] = "@required";
  });
  return out;
}

// K06 document template: written in the editor (text + clause library) or uploaded as a ready file.
function K06Editor({ ctor, payload, onChange, errors, readOnly, file, onUploadFile }: EditorProps) {
  const { t } = useT();
  const mode = modeOf(payload);
  const fields = fieldRowsOf(payload.fields);
  const set = (k: string, v: unknown) => onChange({ ...payload, [k]: v });
  return (
    <View style={{ gap: 14 }}>
      <Segmented value={mode} onChange={(m) => !readOnly && onChange({ ...payload, mode: m, source_file_required: m === "upload" })} options={[{ value: "editor", label: t("admStudioB.k06.modeEditor"), icon: "edit-3" }, { value: "upload", label: t("admStudioB.k06.modeUpload"), icon: "upload" }]} />
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      {mode === "upload" ? (
        <Block title={t("admStudioB.k06.file")} hint={t("admStudioB.k06.fileHint")}><FileBox file={file} onUpload={onUploadFile} readOnly={readOnly} error={errors.file} /></Block>
      ) : (
        <K06Template text={str(payload.template_text)} names={fieldNames(fields)} onChange={(v) => set("template_text", v)} readOnly={readOnly} error={errors.template_text} />
      )}
      <Block title={t("admStudioB.k06.fields")} hint={t(mode === "editor" ? "admStudioB.k06.fieldsHint" : "admStudioB.k06.fieldsHintUpload")} count={fields.length}>
        <FieldRows rows={fields} onChange={(rows) => set("fields", rows)} readOnly={readOnly} errors={errors} prefix="fields" />
      </Block>
      <K06Clauses clauses={clausesOf(payload.clauses)} onChange={(c) => set("clauses", c)} readOnly={readOnly} errors={errors} />
    </View>
  );
}

export const K06: EditorEntry = { Editor: K06Editor, validate: validateK06, emptyPayload: () => ({ mode: "editor", language: "uz-latn", fields: [], template_text: "", clauses: [], source_file_required: false }), handled: HANDLED };
