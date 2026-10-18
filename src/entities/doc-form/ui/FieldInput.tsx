import { useT } from "@/shared/i18n";
import type { FieldError } from "../lib/validate";
import type { DocField } from "../model/types";
import { ChoiceField } from "./ChoiceField";
import { DateInputField } from "./DateInputField";
import { TextInputField } from "./TextInputField";

type Props = { field: DocField; value: string; error?: FieldError | ""; onChange: (v: string) => void };

const CHOICE = new Set(["select", "radio", "multiselect", "multi", "checkbox", "boolean"]);

// Renders one backend field by its `type` (label and required flag as sent).
// A select without options degrades to text, an unknown type to text.
export function FieldInput({ field, value, error, onChange }: Props) {
  const { t } = useT();
  const label = field.required ? `${field.label} *` : field.label;
  const err = error ? t(`dc3.err.${error}`) : undefined;
  const common = { field, value, label, error: err, onChange };
  const choice = CHOICE.has(field.type) && (field.options.length > 0 || field.type === "checkbox" || field.type === "boolean");
  if (choice) return <ChoiceField {...common} />;
  if (field.type === "date") return <DateInputField {...common} />;
  return <TextInputField {...common} />;
}
