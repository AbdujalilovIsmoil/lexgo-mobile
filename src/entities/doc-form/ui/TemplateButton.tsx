import { useState } from "react";
import { Button } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { cleanSourcePath } from "../api/docFormApi";

type Props = { serviceId: string; name: string; label: string };

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Opens the blank (clean) template exactly as the server holds it: the marker-free
// copy, because the marked-up original answers 403 for clients.
export function TemplateButton({ serviceId, name, label }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button title={label} icon="file-text" variant="soft" size="sm" onPress={() => setOpen(true)} />
      <FilePreview visible={open} onClose={() => setOpen(false)} file={{ path: cleanSourcePath(serviceId), name: `${name || "template"}.docx`, mime: DOCX }} />
    </>
  );
}
