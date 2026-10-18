import { BottomSheet, Button, EmptyState, SheetScroll } from "@/shared/ui";
import { QueryBoundary, RowCard } from "@/shared/ui/admin";
import type { FileRef } from "@/shared/ui/preview";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createVersion, docFileName, docKeys, useDocVersions } from "@/entities/my-document";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
type Props = { docId: string; title: string; canCreate: boolean; visible: boolean; onClose: () => void; onOpen: (f: FileRef) => void };

// Snapshots of the document (GET/POST …/versions); each opens as its own DOCX.
export function VersionsSheet({ docId, title, canCreate, visible, onClose, onOpen }: Props) {
  const { t, locale } = useT();
  const q = useDocVersions(docId);
  const create = useAdminMutation({ mutationFn: () => createVersion(docId), invalidate: [docKeys.all], success: "dm4.versionCreated" });
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm4.versions")} snaps={[0.6, 0.92]}>
      <SheetScroll>
        {canCreate ? <Button title={t("dm4.versionNew")} icon="plus" variant="soft" full loading={create.isPending} onPress={() => create.mutate()} /> : null}
        <QueryBoundary query={q}>
          {q.data?.length ? (
            q.data.map((v) => (
              <RowCard key={v.id} icon="clock" title={t("dm4.versionN", { n: v.number })} subtitle={fmtDateTime(v.createdAt, locale)} meta={t("dm4.versionFields", { n: v.answerCount })}
                onPress={v.contractId ? () => onOpen({ path: `/contracts/${encodeURIComponent(v.contractId)}/file`, name: docFileName(`${title} v${v.number}`, "docx", "document"), mime: DOCX }) : undefined} />
            ))
          ) : (
            <EmptyState compact icon="clock" title={t("dm4.versionsEmpty")} text={t("dm4.versionsEmptyText")} />
          )}
        </QueryBoundary>
      </SheetScroll>
    </BottomSheet>
  );
}
