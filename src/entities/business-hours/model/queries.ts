import { useQuery } from "@tanstack/react-query";
import { DEFAULT_HOURS, getBusinessHours } from "../api/hoursApi";

// 2: the shape kept on disk (persistRules keeps ["business-hours", …] for a week); copies written by the older readers are left unread.
export const hoursKey = ["business-hours", 2] as const;

// The office schedule; undefined until the first answer (or the copy on disk) is there.
export const useBusinessHoursQuery = () => useQuery({ queryKey: hoursKey, queryFn: getBusinessHours, staleTime: 15 * 60_000, retry: false });

// The same, with the default schedule standing in until it is known or when the call fails.
export const useBusinessHours = () => useBusinessHoursQuery().data ?? DEFAULT_HOURS;
