import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { knownStatus } from "../api/normStatus";
import type { RStatus } from "../model/types";

// Translated names for categories, statuses, roles and gap states, tidied when the backend sends an unknown word.
export function useRegLabels() {
  const { t } = useT();
  const known = (k: string, fb: string) => (t(k) !== k ? t(k) : fb);
  return {
    cat: (c: string) => (c ? known(`admAiReg.cat.${c}`, humanizeSlug(c)) : t("admAiReg.cat.none")),
    status: (s: RStatus, raw = "") => (knownStatus(raw) ? t(`admAiReg.status.${s}`) : humanizeSlug(raw)),
    role: (r: string) => known(`admAiRegC.roles.${r}`, humanizeSlug(r)),
    gapStatus: (s: string) => known(`admAiRegC.gapStatus.${s}`, humanizeSlug(s)),
  };
}
