import { Input } from "@/shared/ui";
import { DateField } from "@/shared/ui/admin";
import { fieldKind, sanitizeInput, type DocField } from "@/entities/my-document";

type Props = { f: DocField; value: string; onChange: (v: string) => void; error?: boolean };

// One questionnaire field, typed by the backend (text / textarea / number / date / phone / email).
export function AnswerField({ f, value, onChange, error }: Props) {
  const kind = fieldKind(f);
  const label = f.required ? `${f.label} *` : f.label;
  if (kind === "date") return <DateField label={label} value={value} onChange={onChange} />;
  return (
    <Input
      label={label}
      value={value}
      onChangeText={(v) => onChange(sanitizeInput(kind, v))}
      placeholder={f.placeholder || (kind === "phone" ? "+998 90 123 45 67" : undefined)}
      multiline={kind === "multiline"}
      keyboardType={kind === "number" ? "decimal-pad" : kind === "phone" ? "phone-pad" : kind === "email" ? "email-address" : "default"}
      autoCapitalize={kind === "email" ? "none" : "sentences"}
      autoCorrect={kind !== "email"}
      error={error ? " " : undefined}
      style={kind === "multiline" ? { minHeight: 84, textAlignVertical: "top" } : undefined}
    />
  );
}
