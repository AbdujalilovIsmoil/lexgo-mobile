import { SelectField } from "@/shared/ui/admin";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { RefField } from "../../form/RefField";
import type { Errors } from "../../form/types";
import { errorFor, str, withKey } from "../../form/values";
import { showCatalog, showSource } from "./k02Logic";

const MODES = ["required", "optional", "not_required"];
const SOURCES = ["catalog", "upload", "catalog_or_upload"];
type Props = { payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };

// The document template: how it is required, where it comes from, and — for a catalogue source — which one. The later fields appear
// only while the earlier answers make them meaningful (as the schema's visible_when says).
export function K02Template({ payload, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const set = (k: string, v: unknown) => onChange(withKey(payload, k, v));
  return (
    <Block title={t("admStudioD.k02.template")}>
      <SelectField label={t("admStudioD.k02.mode")} value={str(payload.template_mode)} options={MODES.map((v) => ({ value: v, label: t(`admStudioD.k02.modes.${v}`) }))} onChange={(v) => !readOnly && set("template_mode", v)} error={errorFor(errors, "template_mode")} />
      {showSource(payload) ? <SelectField label={t("admStudioD.k02.source")} value={str(payload.template_source)} options={SOURCES.map((v) => ({ value: v, label: t(`admStudioD.k02.sources.${v}`) }))} onChange={(v) => !readOnly && set("template_source", v)} error={errorFor(errors, "template_source")} /> : null}
      {showCatalog(payload) ? <RefField label={t("admStudioD.k02.catalog")} source="/studio/reference/document-templates" value={str(payload.document_template_id) ? [str(payload.document_template_id)] : []} onChange={(a) => set("document_template_id", a[0] ?? "")} readOnly={readOnly} error={errorFor(errors, "document_template_id")} /> : null}
    </Block>
  );
}
