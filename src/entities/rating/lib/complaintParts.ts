import { fmtDate } from "@/shared/lib/format";
import type { ComplaintItem } from "../model/complaint";
import type { useComplaintLabels } from "../model/useComplaintLabels";
import { isOpaqueRef } from "./complaintText";

type Labels = ReturnType<typeof useComplaintLabels>;
type T = (key: string, params?: Record<string, string | number>) => string;

// The words of one complaint row (title, "kind · id · work · date" line, first line of text); shared by every
// list that draws complaints, so they can never disagree.
export function complaintParts(item: ComplaintItem, L: Labels, t: T, locale: string) {
  const quality = item.kind === "quality";
  const facet = quality ? L.source(item.source) : L.category(item.category);
  const title = item.subject || facet || L.kind(item.kind);
  const ref = quality ? "" : item.relatedRef;
  const meta = [facet !== title ? facet : "", item.workId, ref ? (isOpaqueRef(ref) ? t("pwc.row.workLinked") : t("pwc.row.work", { id: ref })) : "", fmtDate(item.createdAt, locale)].filter(Boolean).join(" · ");
  return { quality, title, meta, line: item.description || L.hint(item) };
}
