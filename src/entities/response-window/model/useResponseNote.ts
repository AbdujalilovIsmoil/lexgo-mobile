import { isWorkingTime, useBusinessHours } from "@/entities/business-hours";
import { useRuntimeCaps } from "@/entities/market-flow";
import { useNow } from "@/shared/lib/pay/useNow";
import { useT } from "@/shared/i18n";

// What the client is told about the specialist's answer before ordering (enterprise §5: the backend owns the deadline, the phone never
// makes one up): outside working hours that the clock waits for them; otherwise how long an answer takes, from the platform's own
// setting (runtime capabilities), and nothing when it is unknown.
export function useResponseNote(): { afterHours: boolean; text: string } {
  const { t } = useT();
  const hours = useBusinessHours();
  const caps = useRuntimeCaps();
  const now = useNow(true, 60_000);
  const afterHours = !isWorkingTime(hours, now);
  const minutes = caps.data?.sellerResponseMinutes ?? null;
  return { afterHours, text: afterHours ? t("csv.afterHours") : minutes ? t("csv.respondIn", { n: minutes }) : "" };
}
