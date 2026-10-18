import { Input } from "../Input";

// YYYY-MM-DD input: digits only, dashes are added while typing.
export const maskDate = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join("-");
};
export const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export function DateField({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return <Input label={label} value={value} onChangeText={(v) => onChange(maskDate(v))} placeholder="2026-10-31" keyboardType="number-pad" maxLength={10} error={value.length === 10 && !isDate(value) ? " " : undefined} />;
}
