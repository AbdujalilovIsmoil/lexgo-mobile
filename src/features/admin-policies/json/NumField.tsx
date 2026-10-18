import { useState } from "react";
import { Input } from "@/shared/ui";

const parse = (s: string) => {
  const v = s.trim().replace(",", ".");
  return v === "" ? NaN : Number(v);
};
const show = (n: number) => (Number.isFinite(n) ? String(n) : "");
const same = (a: number, b: number) => a === b || (Number.isNaN(a) && Number.isNaN(b));

// Number input that reports NaN while the text is empty or not a number (saving is blocked then).
// The typed text is kept while it still means the value; if the value is changed from outside it wins.
export function NumField({ label, value, onChange, error, hint }: { label?: string; value: number; onChange: (v: number) => void; error?: boolean; hint?: string }) {
  const [text, setText] = useState(show(value));
  const set = (v: string) => {
    const clean = v.replace(/[^\d.,-]/g, "");
    setText(clean);
    onChange(parse(clean));
  };
  return <Input label={label} hint={hint} value={same(parse(text), value) ? text : show(value)} onChangeText={set} keyboardType="decimal-pad" error={error || Number.isNaN(value) ? " " : undefined} />;
}
