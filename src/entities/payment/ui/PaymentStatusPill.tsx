import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { statusLabel } from "../lib/format";
import { PHASE_TONE, phaseOf } from "../model/status";

// Backend status as a coloured pill; a Telegram payment waiting for a person says so.
export function PaymentStatusPill({ status, method, small = true }: { status: string; method: string; small?: boolean }) {
  const { t } = useT();
  const phase = phaseOf({ status, method });
  const label = phase === "pending_confirmation" ? t("py1.status.confirming") : statusLabel(status, t);
  return <Pill label={label} tone={PHASE_TONE[phase]} small={small} live={phase === "awaiting" || phase === "pending_confirmation"} />;
}
