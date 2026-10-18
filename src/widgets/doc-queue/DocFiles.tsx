import { SectionCard } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocFile, DocReq } from "@/entities/doc-queue";
import { FileRow } from "./FileRow";

type Props = { doc: DocReq; onOpen: (f: DocFile) => void };

// Everything attached to the request: the client's files, the clean template and, once sent, the finished document.
export function DocFiles({ doc, onOpen }: Props) {
  const { t } = useT();
  const mine = doc.finalFile ? [doc.finalFile] : [];
  const client = [...doc.files, ...(doc.templateFile ? [doc.templateFile] : [])];
  return (
    <>
      {mine.length ? <SectionCard title={t("ad1.sentFile")}>{mine.map((f) => <FileRow key={f.id} file={f} onPress={() => onOpen(f)} />)}</SectionCard> : null}
      <SectionCard title={t("ad1.files")}>
        {client.length ? client.map((f) => <FileRow key={`${f.kind}-${f.id}`} file={f} onPress={() => onOpen(f)} />) : <Text variant="small" tone="gray">{t("ad1.noFiles")}</Text>}
      </SectionCard>
    </>
  );
}
