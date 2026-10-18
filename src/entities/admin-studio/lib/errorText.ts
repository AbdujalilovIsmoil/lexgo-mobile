import { useT } from "@/shared/i18n";
import { studioError } from "../api/errors";

// Server message verbatim → first field errors → a business code (ntd.bz.*) → the hint for the error kind.
export function useStudioErrorText() {
  const { t } = useT();
  return (e: unknown): string => {
    const se = studioError(e);
    const fields = Object.values(se.fieldErrors).filter(Boolean).slice(0, 3).join(" · ");
    const bz = se.code && t(`ntd.bz.${se.code}`) !== `ntd.bz.${se.code}` ? t(`ntd.bz.${se.code}`) : "";
    return se.message || fields || bz || t(`admStudio.err.${se.kind}`);
  };
}
