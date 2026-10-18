import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { ServiceError } from "../model/serviceTypes";

// User-facing sentence for a classified service error (og5.err.*); the server's own text is the last resort.
export function useServiceErrorText() {
  const { t } = useT();
  return (e: ServiceError): string => {
    if (e.kind === "range") return t("og5.err.range", { min: fmtMoney(e.min), max: fmtMoney(e.max) });
    if (e.kind === "other") return e.message || t("og5.err.other");
    return t(`og5.err.${e.kind}`);
  };
}
