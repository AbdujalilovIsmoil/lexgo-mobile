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
      if (e.detail) return e.detail;
      // Business codes the backend answers without a message (marketplace_order_already_active, rating_window_closed…).
      const key = `ntd.bz.${e.code ?? ""}`;
      if (e.code && t(key) !== key) return t(key);
    }
    return t("common.serverError");
  };
}

export function ErrorView({ error, onRetry, compact }: Props) {
  const { t } = useT();
  const text = useErrorText();
  return <EmptyState icon={error instanceof ApiError && error.status === 403 ? "lock" : "alert-circle"} title={text(error)} actionLabel={onRetry ? t("common.retry") : undefined} onAction={onRetry} compact={compact} />;
}
