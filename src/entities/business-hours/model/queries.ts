import { useQuery } from "@tanstack/react-query";
import { DEFAULT_HOURS, getBusinessHours } from "../api/hoursApi";

// Refetched every 15 minutes while mounted; a failed call keeps the default schedule.
export function useBusinessHours() {
  const q = useQuery({ queryKey: ["business-hours"], queryFn: getBusinessHours, staleTime: 15 * 60_000, refetchInterval: 15 * 60_000, retry: false });
  return q.data ?? DEFAULT_HOURS;
}
