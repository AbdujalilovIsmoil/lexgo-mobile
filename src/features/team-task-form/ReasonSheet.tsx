import { useState } from "react";
import { FormSheet } from "@/shared/ui/admin";
import { Input, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; title: string; lead: string; label: string; cta: string; danger?: boolean; busy: boolean; onSubmit: (reason: string) => void };

// A required comment: why a task goes back to work, or why it is deleted. Empty is refused with the web's message.
export function ReasonSheet({ visible, onClose, title, lead, label, cta, danger, busy, onSubmit }: Props) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) { setText(""); setErr(""); }
  }
  const go = () => (text.trim() ? onSubmit(text.trim()) : setErr(t("ttm.reasonNeeded")));
  return (
    <FormSheet visible={visible} onClose={onClose} title={title} onSubmit={go} submitLabel={cta} submitting={busy} danger={danger}>
      <Text variant="small" tone="gray">{lead}</Text>
      <Input label={label} value={text} onChangeText={(v) => { setText(v); setErr(""); }} multiline maxLength={2000} error={err} autoFocus />
    </FormSheet>
  );
}
