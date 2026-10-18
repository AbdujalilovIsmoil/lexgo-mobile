import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";

// Translators for backend codes: the module's own strings first, the code tidied up otherwise.
export function useMktLabels() {
  const { t } = useT();
  const pick = (ns: string) => (code: string) => (code && t(`${ns}.${code}`) !== `${ns}.${code}` ? t(`${ns}.${code}`) : humanizeSlug(code) || "—");
  return { status: pick("admMktB.status"), pay: pick("admMktB.pay"), type: pick("admMktB.types"), channel: pick("admMktB.channels"), provider: pick("admMktB.providers"), action: pick("admMktB.actions"), confirm: pick("admMktB.confirmStatus") };
}
