import { RowCard, StatusPill } from "@/shared/ui/admin";
import { fmtDate } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { OnbDoc } from "@/entities/pro-onboarding";

// One uploaded proof document: file name, kind, review status.
export function DocRow({ doc }: { doc: OnbDoc }) {
  const { t, locale } = useT();
  const kind = t(`sl3.docs.kind.${doc.kind}`);
  return (
    <RowCard
      icon="file-text"
      title={doc.name || doc.workId}
      subtitle={kind.startsWith("sl3.") ? doc.kind : kind}
      meta={[doc.workId, fmtDate(doc.createdAt, locale)].filter(Boolean).join(" · ")}
      right={doc.status ? <StatusPill status={doc.status} /> : undefined}
    />
  );
}
