import { SelectField, MultiChips, SwitchField, Field } from "@/shared/ui/admin";
import type { DocField } from "../model/types";

type Props = { field: DocField; value: string; error?: string; label: string; onChange: (v: string) => void };

const SPLIT = /\s*[;,]\s*/;

// select / multiselect / checkbox. Multi values travel as "a, b"; a checkbox as "true".
export function ChoiceField({ field: f, value, error, label, onChange }: Props) {
  if (f.type === "checkbox" || f.type === "boolean") {
    return <SwitchField label={label} hint={f.hint} value={value === "true"} onChange={(v) => onChange(v ? "true" : "")} />;
  }
  const options = f.options.map((o) => ({ value: o, label: o }));
  if (f.type === "multiselect" || f.type === "multi") {
    const chosen = value ? value.split(SPLIT) : [];
    return (
      <Field label={label} hint={f.hint} error={error}>
        <MultiChips options={options} value={chosen} onChange={(v) => onChange(v.join(", "))} />
      </Field>
    );
  }
  return <SelectField label={label} value={value} options={options} onChange={onChange} error={error} />;
}
