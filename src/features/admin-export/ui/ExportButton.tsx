import { useState } from "react";
import { useAccess } from "@/entities/access";
import { exportByKey } from "@/entities/admin-export";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ExportSheet } from "./ExportSheet";

// Header button of a module: opens the export sheet (period + filter) of the Excel export `id`.
// Renders nothing when the user lacks the permission behind it.
export function ExportButton({ id }: { id: string }) {
  const { t } = useT();
  const a = useAccess();
  const [open, setOpen] = useState(false);
  const def = exportByKey(id);
  if (!def || !def.visible(a)) return null;
  return (
    <>
      <IconButton icon="download" onPress={() => setOpen(true)} label={t("ag2.download")} />
      <ExportSheet def={open ? def : null} onClose={() => setOpen(false)} />
    </>
  );
}
