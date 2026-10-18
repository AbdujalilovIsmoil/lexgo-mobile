import { ApiError } from "@/shared/api";
import { translate } from "@/shared/i18n";
import { useLocaleStore } from "@/shared/i18n/localeStore";

// User-facing text of a failed AI call for non-React code (stores, flows): 5xx / 503 / network / rate.
export function chatErrorText(e: unknown): string {
  const t = (k: string) => translate(useLocaleStore.getState().locale, k);
  if (e instanceof ApiError) {
    if (e.status === 0) return t("ax1.errNetwork");
    if (e.status === 503) return t("ax1.errUnavailable");
    if (e.status === 429) return e.detail || t("common.rateLimited");
    if (e.status >= 500) return t("ax1.errServer");
    if (e.detail) return e.detail;
  }
  return t("ai.sendFailed");
}
