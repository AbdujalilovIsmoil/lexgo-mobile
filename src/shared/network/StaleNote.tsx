import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { Text } from "@/shared/ui";
import { useIsOnline } from "./useNetwork";

// "Offline: saved copy · Updated 14:05": shown above lists that are served from the phone while there is no connection.
// Renders nothing online or without data. `updatedAt` is the query's dataUpdatedAt.
export function StaleNote({ updatedAt, hasData }: { updatedAt: number; hasData: boolean }) {
  const { t, locale } = useT();
  const online = useIsOnline();
  if (online || !hasData) return null;
  const when = updatedAt > 0 ? fmtDateTime(new Date(updatedAt).toISOString(), locale) : "";
  return (
    <Text variant="caption" tone="gray" accessibilityLiveRegion="polite">
      {t("nt3.net.cached")}
      {when ? ` · ${t("nt3.net.updatedAt", { when })}` : ""}
    </Text>
  );
}
