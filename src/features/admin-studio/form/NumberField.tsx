import { useState } from "react";
import { TextField } from "./TextField";

type Props = { label: string; value: unknown; onChange: (v: number | undefined) => void; readOnly?: boolean; error?: string; hint?: string; required?: boolean };

// Numeric input. The typed text is kept locally so "1." and "-" survive while typing.
export function NumberField({ label, value, onChange, readOnly, error, hint, required }: Props) {
  const text = value == null ? "" : String(value);
  const [txt, setTxt] = useState(text);
  const [prev, setPrev] = useState(text);
  if (text !== prev) {
    setPrev(text);
    if (Number(txt) !== Number(text) && !(txt === "" && text === "")) setTxt(text);
  }
  const set = (v: string) => {
    const clean = v.replace(/,/g, ".").replace(/[^\d.-]/g, "");
    setTxt(clean);
    const n = parseFloat(clean);
    onChange(clean === "" || !Number.isFinite(n) ? undefined : n);
  };
  return <TextField label={label} value={txt} onChange={set} readOnly={readOnly} error={error} hint={hint} required={required} keyboardType="numbers-and-punctuation" />;
}
