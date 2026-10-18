import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/shared/i18n";
import { DEFAULT_HOURS, getBusinessHours } from "../api/hoursApi";
import { deadlineLabel, isWorkingTime, responseDeadline } from "../lib/deadline";

// Outside working hours the client is told when the advocate's 30-minute window starts.
export function useResponseNote(): { afterHours: boolean; respondBy: string } {
  const { t } = useT();
  const { data } = useQuery({ queryKey: ["business-hours"], queryFn: getBusinessHours, staleTime: 10 * 60 * 1000 });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(iv);
  }, []);
  const hours = data ?? DEFAULT_HOURS;
  const words = { today: t("csv.deadlineToday"), tomorrow: t("csv.deadlineTomorrow") };
  return { afterHours: !isWorkingTime(hours, now), respondBy: deadlineLabel(responseDeadline(hours, now, 30), now, words) };
}
