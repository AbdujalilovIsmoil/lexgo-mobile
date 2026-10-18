import { assistErrorKind, duplicateOf, isPriorPurchase } from "@/entities/admin-support";
import { useErrorText } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// User-facing text of a failed assist write (duplicates, plan/period/seller problems, then the generic one).
export function useAssistError() {
  const { t } = useT();
  const generic = useErrorText();
  return (e: unknown): string => {
    const dup = duplicateOf(e);
    if (dup) return dup.workId ? t(`admSupB.err.${dup.kind}Dup`, { id: dup.workId }) : t(`admSupB.err.${dup.kind}DupPlain`);
    if (isPriorPurchase(e)) return t("admSupB.err.priorPurchase");
    const kind = assistErrorKind(e);
    return kind ? t(`admSupB.err.${kind}`) : generic(e);
  };
}
