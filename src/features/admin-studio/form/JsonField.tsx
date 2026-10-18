import { useState } from "react";
import { PayloadView, useStudioText } from "@/entities/admin-studio";
import { Button, Input, Text } from "@/shared/ui";
import { Field, FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { label: string; value: unknown; empty: unknown; onChange: (v: unknown) => void; readOnly?: boolean; error?: string; required?: boolean };

// Objects and lists of objects: a read-only summary plus an "edit as JSON" sheet that validates before applying.
export function JsonField({ label, value, empty, onChange, readOnly, error, required }: Props) {
  const { t } = useT();
  const { fieldErr } = useStudioText();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [bad, setBad] = useState(false);
  const shape = Array.isArray(empty) ? "array" : "object";
  const start = () => (setText(JSON.stringify(value ?? empty, null, 2)), setBad(false), setOpen(true));
  const apply = () => {
    try {
      const v: unknown = JSON.parse(text || "null");
      const ok = v !== null && typeof v === "object" && Array.isArray(v) === (shape === "array");
      if (!ok) return setBad(true);
      onChange(v);
      setOpen(false);
    } catch {
      setBad(true);
    }
  };
  return (
    <Field label={required ? `${label} *` : label} error={error ? fieldErr(error) : undefined}>
      <PayloadView value={value ?? empty} />
      {readOnly ? null : <Button title={t("admStudioB.editJson")} icon="code" variant="soft" size="sm" onPress={start} />}
      <FormSheet visible={open} onClose={() => setOpen(false)} title={label} subtitle={t("admStudioB.jsonHint")} onSubmit={apply} submitLabel={t("adm.apply")} snaps={[0.8, 0.94]}>
        <Input value={text} onChangeText={(v) => (setText(v), setBad(false))} multiline autoCapitalize="none" autoCorrect={false} error={bad ? fieldErr(shape === "array" ? "@list" : "@object") : undefined} style={{ minHeight: 240, textAlignVertical: "top" }} />
        <Text variant="caption" tone="gray">{t("admStudioB.jsonNote")}</Text>
      </FormSheet>
    </Field>
  );
}
