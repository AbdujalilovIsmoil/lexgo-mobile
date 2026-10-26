import { useEffect, useState } from "react";
import { deadlineLabel, isWorkingTime, responseDeadline, useBusinessHours } from "@/entities/business-hours";
import { useT } from "@/shared/i18n";

// Outside working hours the client is told when the advocate's 30-minute window starts.
export function useResponseNote(): { afterHours: boolean; respondBy: string } {
  const { t } = useT();
  const hours = useBusinessHours();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(iv);
  }, []);
  const words = { today: t("csv.deadlineToday"), tomorrow: t("csv.deadlineTomorrow") };
  return { afterHours: !isWorkingTime(hours, now), respondBy: deadlineLabel(responseDeadline(hours, now, 30), now, words) };
}
