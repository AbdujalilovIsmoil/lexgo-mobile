import { useCallback, useMemo } from "react";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { useWorkText } from "@/entities/work";

// Labels of order statuses (ccs.os.*) and case statuses / stages (shared work labels), tidied when unknown.
export function useCaseText() {
  const { t } = useT();
  const work = useWorkText();
  const order = useCallback((s: string) => (t(`ccs.os.${s}`) !== `ccs.os.${s}` ? t(`ccs.os.${s}`) : humanizeSlug(s)), [t]);
  const status = useCallback((s: string) => work.status(s), [work]);
  return useMemo(() => ({ order, status }), [order, status]);
}
