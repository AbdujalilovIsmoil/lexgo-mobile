import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";

// Readable text for a failed security call. Offline, rate limits, a dead code channel (503) and
// server failures get their own wording; any other refusal reads as `fallback` (an i18n key).
export function useSecError() {
  const { t } = useT();
  return (e: unknown, fallback: string): string => {
    if (e instanceof ApiError) {
      if (e.status === 0) return t("common.offline");
      if (e.status === 429) return e.detail || t("common.rateLimited");
      if (e.status === 503) return t("admSec.channelDown");
      if (e.status >= 500) return t("admSec.errStart");
    }
    return t(fallback);
  };
}
