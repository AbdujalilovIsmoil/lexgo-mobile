import { FormSheet } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { DocFile, DocReq } from "@/entities/doc-queue";
import { DocFiles } from "../DocFiles";
import { DocHead } from "../DocHead";
import { DocNeed } from "../DocNeed";

type Props = { doc: DocReq; visible: boolean; onClose: () => void; onFile: (f: DocFile) => void };

// The request while editing: need, answers and files, without leaving the editor.
export function InfoSheet({ doc, visible, onClose, onFile }: Props) {
  const { t } = useT();
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("ad5.requestInfo")} subtitle={doc.clientName} snaps={[0.7, 0.94]}>
      <DocHead doc={doc} />
      <DocNeed doc={doc} />
      <DocFiles doc={doc} onOpen={onFile} />
    </FormSheet>
  );
}
