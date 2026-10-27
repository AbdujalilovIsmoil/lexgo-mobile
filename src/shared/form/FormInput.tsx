import type { ComponentProps } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { DatePickerField, Input, PhoneInput, TimePickerField } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props<T extends FieldValues> = Omit<ComponentProps<typeof Input>, "value" | "onChangeText" | "error"> & {
  control: Control<T>;
  name: Path<T>;
  /** Rewrites what is typed (phone mask, digits only …) before it goes into the form. */
  format?: (v: string) => string;
};

/** The schema's message for a field, translated ("ntd.val.min|10" → "At least 10 characters"). */
export function useFieldError() {
  const { t } = useT();
  return (msg?: string): string | undefined => {
    if (!msg) return undefined;
    const [key, n] = msg.split("|");
    return t(key, n ? { n } : undefined);
  };
}

// An Input wired to a react-hook-form field: value, change, blur, the validation message and the input itself (setFocus reaches it).
export function FormInput<T extends FieldValues>({ control, name, format, ...rest }: Props<T>) {
  const tr = useFieldError();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input {...rest} ref={field.ref} value={String(field.value ?? "")} onChangeText={(v) => field.onChange(format ? format(v) : v)} onBlur={field.onBlur} error={tr(fieldState.error?.message)} />
      )}
    />
  );
}

// The international phone field (country + formatted number) wired to a react-hook-form field.
export function FormPhoneInput<T extends FieldValues>({ control, name, label, hint, placeholder, autoFocus }: { control: Control<T>; name: Path<T>; label?: string; hint?: string; placeholder?: string; autoFocus?: boolean }) {
  const tr = useFieldError();
  return <Controller control={control} name={name} render={({ field, fieldState }) => <PhoneInput label={label} hint={hint} placeholder={placeholder} autoFocus={autoFocus} value={String(field.value ?? "")} onChange={field.onChange} error={tr(fieldState.error?.message)} />} />;
}

// A date / time picker field wired to a react-hook-form field (value "YYYY-MM-DD" / "HH:MM").
export function FormDate<T extends FieldValues>({ control, name, label, min, clearable }: { control: Control<T>; name: Path<T>; label?: string; min?: string; clearable?: boolean }) {
  const tr = useFieldError();
  return <Controller control={control} name={name} render={({ field, fieldState }) => <DatePickerField label={label} min={min} clearable={clearable} value={String(field.value ?? "")} onChange={field.onChange} error={tr(fieldState.error?.message)} />} />;
}
export function FormTime<T extends FieldValues>({ control, name, label, clearable }: { control: Control<T>; name: Path<T>; label?: string; clearable?: boolean }) {
  const tr = useFieldError();
  return <Controller control={control} name={name} render={({ field, fieldState }) => <TimePickerField label={label} clearable={clearable} value={String(field.value ?? "")} onChange={field.onChange} error={tr(fieldState.error?.message)} />} />;
}
