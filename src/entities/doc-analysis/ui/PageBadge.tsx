import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocAnalysis } from "../model/types";

// "12 bet · PDF'dan sanaldi" — says whether the server counted real pages or estimated from text.
export function PageBadge({ result }: { result: DocAnalysis }) {
  const { t } = useT();
  const src = result.pageSource === "pdf_pages" ? t("dc8.srcPdf") : result.pageSource === "text_estimate" ? t("dc8.srcText") : "";
  return <Pill label={`${t("docs.pages", { n: result.pageCount || 1 })}${src ? ` · ${src}` : ""}`} tone="blue" small icon="layers" />;
}
