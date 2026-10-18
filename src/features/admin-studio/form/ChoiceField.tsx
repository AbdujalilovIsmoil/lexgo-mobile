import { useStudioText } from "@/entities/admin-studio";
import { Field, MultiChips, SelectField } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { TextField } from "./TextField";

// Option labels: translated when the app knows the value (languages, channels …), else as sent.
export function useOptLabel() {
  const { t } = useT();
  return (v: string) => (t(`admStudioB.opt.${v}`) !== `admStudioB.opt.${v}` ? t(`admStudioB.opt.${v}`) : humanizeSlug(v));
}

type One = { label: string; options: string[]; value: string; onChange: (v: string) => void; readOnly?: boolean; error?: string; required?: boolean };

export function ChoiceField({ label, options, value, onChange, readOnly, error, required }: One) {
  const opt = useOptLabel();
  const { fieldErr } = useStudioText();
  const all = value && !options.includes(value) ? [...options, value] : options;
  if (readOnly) return <TextField label={label} value={value ? opt(value) : ""} onChange={() => undefined} readOnly />;
  return <SelectField label={required ? `${label} *` : label} value={value} options={all.map((o) => ({ value: o, label: opt(o) }))} onChange={onChange} error={error ? fieldErr(error) : undefined} />;
}

type Many = { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; readOnly?: boolean; error?: string; required?: boolean };

export function MultiChoiceField({ label, options, value, onChange, readOnly, error, required }: Many) {
  const opt = useOptLabel();
  const { fieldErr } = useStudioText();
  const all = [...options, ...value.filter((v) => !options.includes(v))];
  return (
    <Field label={required ? `${label} *` : label} error={error ? fieldErr(error) : undefined}>
      {readOnly ? <TextField label="" value={value.map(opt).join(", ")} onChange={() => undefined} readOnly /> : <MultiChips options={all.map((o) => ({ value: o, label: opt(o) }))} value={value} onChange={onChange} />}
    </Field>
  );
}
