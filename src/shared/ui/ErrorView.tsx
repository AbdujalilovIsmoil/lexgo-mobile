import { ApiError } from "@/shared/api/errors";
import { useT } from "@/shared/i18n";
import { EmptyState } from "./EmptyState";

type Props = { error: unknown; onRetry?: () => void; compact?: boolean };

// Maps ApiError → the same user-facing copy as lib/errorText.ts on the web.
export function useErrorText() {
  const { t } = useT();
  return (e: unknown): string => {
    if (e instanceof ApiError) {
      if (e.status === 0) return t("common.offline");
      if (e.status === 403) return t("common.forbidden");
      if (e.status === 404) return t("common.notFound");
      if (e.status === 429) return t("common.rateLimited");
      // TZ §2.4: the code decides, not the backend's sentence — a code the app knows is explained in the user's language; any other
      // refusal keeps the server's own message.
      const known = e.code ? [`ntd.bz.${e.code}`, `mf.err.${e.code}`].find((k) => t(k) !== k) : undefined;
      if (known) return t(known);
      if (e.detail) return e.detail;
    }
    return t("common.serverError");
  };
}

export function ErrorView({ error, onRetry, compact }: Props) {
  const { t } = useT();
  const text = useErrorText();
  const status = error instanceof ApiError ? error.status : -1;
  return <EmptyState icon={status === 403 ? "lock" : status === 0 ? "wifi-off" : "alert-circle"} title={text(error)} actionLabel={onRetry ? t("common.retry") : undefined} onAction={onRetry} compact={compact} />;
}
