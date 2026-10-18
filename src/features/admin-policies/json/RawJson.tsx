import { useState } from "react";
import { BAD } from "@/entities/admin-policies";
import { Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Fallback for a value of an unknown shape: edited as JSON text, valid once it parses.
export function RawJson({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const { t } = useT();
  const [text, setText] = useState(JSON.stringify(value, null, 2) ?? "");
  const [bad, setBad] = useState(false);
  const set = (v: string) => {
    setText(v);
    try {
      onChange(JSON.parse(v));
      setBad(false);
    } catch {
      onChange(BAD);
      setBad(true);
    }
  };
  return <Input label={`${label} · JSON`} value={text} onChangeText={set} multiline autoCapitalize="none" autoCorrect={false} error={bad ? t("admPol.badJson") : undefined} style={{ fontFamily: "Menlo", fontSize: 12 }} />;
}
