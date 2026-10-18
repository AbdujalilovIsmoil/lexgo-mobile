import { View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import type { FileRef } from "@/shared/ui/preview";
import { useT } from "@/shared/i18n";
import { docFileName, type MyDoc, type UnlockPolicy } from "@/entities/my-document";
import { useShare } from "../model/useShare";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
type Props = { doc: MyDoc; policy?: UnlockPolicy; onOpen: (f: FileRef) => void };

// The finished file (…/file), a DOCX of the current state (…/docx) and the blank template (…/clean-template-file).
export function FileActions({ doc, policy, onOpen }: Props) {
  const { t } = useT();
  const dl = useShare();
  const base = `/document-requests/${encodeURIComponent(doc.id)}`;
  const main: FileRef | null = doc.file ? { path: doc.file.path, name: doc.file.name, mime: doc.file.mime || DOCX } : null;
  const draft: FileRef | null = !main && policy?.canGenerate && policy.formats.includes("docx") ? { path: `${base}/docx`, name: docFileName(doc.title, "docx", "document"), mime: DOCX } : null;
  const blank: FileRef | null = doc.templateId ? { path: `${base}/clean-template-file`, name: docFileName(`${doc.title} (${t("dm3.blankSuffix")})`, "docx", "document"), mime: DOCX } : null;
  if (!main && !draft && !blank) return null;
  const f = main ?? draft;
  return (
    <SectionCard title={main ? t("dm3.fileTitle") : t("dm3.fileDraftTitle")}>
      {f ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title={t("dm3.open")} icon="eye" onPress={() => onOpen(f)} style={{ flex: 1 }} />
          <Button title={t("dm3.download")} icon="download" variant="soft" loading={dl.busy} onPress={() => void dl.share(f)} style={{ flex: 1 }} />
        </View>
      ) : null}
      {main ? null : f ? <Text variant="caption" tone="gray">{t("dm3.draftHint")}</Text> : null}
      {blank ? <Button title={t("dm3.blank")} icon="file" variant="line" size="sm" onPress={() => onOpen(blank)} /> : null}
    </SectionCard>
  );
}
