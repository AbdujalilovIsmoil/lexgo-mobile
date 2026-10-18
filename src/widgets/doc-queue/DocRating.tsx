import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { useDocRating, type DocReq } from "@/entities/doc-queue";

// Completed work: has the client rated it yet? (best effort — hidden when the client-owned endpoint is closed to us).
export function DocRating({ doc }: { doc: DocReq }) {
  const { t, locale } = useT();
  const q = useDocRating(doc.documentRequestId, doc.status === "completed");
  if (!q.data) return null;
  const r = q.data;
  const line = r.submitted ? `★ ${r.stars}/5${r.comment ? ` — ${r.comment}` : ""}` : r.available ? t("ad1.ratingOpen", { at: fmtDateTime(r.deadline, locale) }) : t("ad1.ratingNone");
  return (
    <SectionCard title={t("ad1.rating")}>
      <Text variant="body">{line}</Text>
    </SectionCard>
  );
}
