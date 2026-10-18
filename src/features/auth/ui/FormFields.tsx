import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { useFieldError } from "@/shared/form";
import { PasswordField } from "./PasswordField";
import { PhoneField } from "./PhoneField";

type P<T extends FieldValues> = { control: Control<T>; name: Path<T>; error?: string; autoFocus?: boolean };

// The masked phone input wired to a react-hook-form field.
export function FormPhone<T extends FieldValues>({ control, name, error, autoFocus }: P<T>) {
  const tr = useFieldError();
  return <Controller control={control} name={name} render={({ field, fieldState }) => <PhoneField value={String(field.value ?? "")} onChange={field.onChange} error={tr(fieldState.error?.message) ?? error} autoFocus={autoFocus} />} />;
}

// The password input wired to a react-hook-form field; `error` is the server's answer (wrong password …), shown when the field itself is valid.
export function FormPassword<T extends FieldValues>({ control, name, error, hint, newPassword, onSubmit }: P<T> & { hint?: string; newPassword?: boolean; onSubmit?: () => void }) {
  const tr = useFieldError();
  return <Controller control={control} name={name} render={({ field, fieldState }) => <PasswordField value={String(field.value ?? "")} onChange={field.onChange} error={tr(fieldState.error?.message) ?? error} hint={hint} newPassword={newPassword} onSubmit={onSubmit} />} />;
}
