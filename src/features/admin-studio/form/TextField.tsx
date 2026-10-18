import type { KeyboardTypeOptions } from "react-native";
import { useStudioText } from "@/entities/admin-studio";
import { Input } from "@/shared/ui";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  error?: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  mono?: boolean;
  onBlur?: () => void;
};

// Text input for the studio forms: required star, read-only mode, "@token" errors translated.
export function TextField({ label, value, onChange, readOnly, error, hint, required, multiline, placeholder, keyboardType, mono, onBlur }: Props) {
  const { fieldErr } = useStudioText();
  return (
    <Input
      label={required ? `${label} *` : label}
      value={value}
      onChangeText={onChange}
      editable={!readOnly}
      onBlur={onBlur}
      multiline={multiline}
      placeholder={readOnly ? undefined : placeholder}
      keyboardType={keyboardType}
      autoCapitalize={mono ? "none" : "sentences"}
      autoCorrect={!mono}
      error={error ? fieldErr(error) : undefined}
      hint={hint}
      style={multiline ? { minHeight: 110, textAlignVertical: "top" } : undefined}
    />
  );
}
