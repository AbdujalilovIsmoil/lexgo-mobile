import type { KeyboardTypeOptions } from "react-native";
import { Input } from "@/shared/ui";
import { formatUzPhone } from "@/shared/lib/phone";
import { useT } from "@/shared/i18n";
import type { DocField } from "../model/types";
import { placeholderOf } from "./placeholder";

type Props = { field: DocField; value: string; error?: string; label: string; onChange: (v: string) => void };

const KEYS: Record<string, KeyboardTypeOptions> = { email: "email-address", number: "numbers-and-punctuation", int: "numbers-and-punctuation", integer: "numbers-and-punctuation", money: "numbers-and-punctuation", phone: "phone-pad", tel: "phone-pad" };
const LONG = new Set(["textarea", "long", "multiline"]);

// text / textarea / number / email / phone, with the keyboard the type calls for.
export function TextInputField({ field: f, value, error, label, onChange }: Props) {
  const { t } = useT();
  const phone = f.type === "phone" || f.type === "tel";
  const long = LONG.has(f.type);
  return (
    <Input
      label={label}
      value={value}
      error={error}
      hint={f.hint}
      onChangeText={(v) => onChange(phone ? (v.replace(/\D/g, "").replace(/^998/, "") ? formatUzPhone(v) : "") : v)}
      placeholder={phone ? "+998 90 123 45 67" : placeholderOf(f) ?? t("dc3.enter")}
      keyboardType={KEYS[f.type] ?? "default"}
      autoCapitalize={f.type === "email" ? "none" : long || f.type === "text" ? "sentences" : "none"}
      autoCorrect={f.type !== "email" && !phone}
      multiline={long}
      maxLength={f.maxLength}
      style={long ? { minHeight: 96, textAlignVertical: "top" } : undefined}
    />
  );
}
