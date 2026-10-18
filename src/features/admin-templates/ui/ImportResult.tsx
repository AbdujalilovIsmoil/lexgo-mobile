import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { ImportOutcome } from "../model/useImportFlow";
import { FieldList } from "./FieldList";

// What the import produced: the detected fields and a text preview (DOCX) or the number of drafts (ZIP).
export function ImportResult({ outcome: o }: { outcome: ImportOutcome }) {
  const { t } = useT();
  const fields = o.preview?.fields ?? [];
  return (
    <SectionCard title={o.mode === "zip" ? t("admTplB.zipDone", { n: o.count }) : t("admTplB.fieldsFound", { n: fields.length })}>
      {o.mode === "docx" ? (fields.length ? <FieldList fields={fields} /> : <Text variant="small" tone="gray">{t("admTplB.noFields")}</Text>) : null}
      {o.preview?.previewText ? <Text variant="small" tone="gray" selectable numberOfLines={14}>{o.preview.previewText}</Text> : null}
      <Text variant="caption" tone="ok">{t("admTplB.draftNote")}</Text>
    </SectionCard>
  );
}
