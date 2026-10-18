import { useState } from "react";
import { IconButton } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useCcTools } from "./useCcTools";

// Header button of the call-center tabs: opens the operator's extra tools (urgent pool, complaints, call logs, notify).
export function CcToolsButton() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const tools = useCcTools();
  if (!tools.length) return null;
  return (
    <>
      <IconButton icon="grid" size={40} label={t("cc1.tools.title")} onPress={() => setOpen(true)} />
      <ActionList visible={open} onClose={() => setOpen(false)} title={t("cc1.tools.title")} actions={tools} />
    </>
  );
}
