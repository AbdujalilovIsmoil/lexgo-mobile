import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtWait } from "../lib/fmtWait";
import type { OtpClock } from "../model/useOtpClock";

// Under the code boxes: the server's last answer, otherwise the expiry countdown / "expired".
export function OtpStatus({ clock, error, note }: { clock: OtpClock; error: string | null; note: string | null }) {
  const { t } = useT();
  if (error) return <Text variant="small" tone="err" center>{error}</Text>;
  if (note) return <Text variant="small" tone="ok" center>{note}</Text>;
  if (!clock.known) return null;
  return (
    <Text variant="small" tone={clock.expired ? "err" : "gray"} center>
      {clock.expired ? t("auth.expired") : t("auth.expiresIn", { time: fmtWait(clock.expiresIn) })}
    </Text>
  );
}
