import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getAvailability, saveAvailability } from "../api/availabilityApi";

export const availabilityKeys = { all: ["pro-availability"] as const };

export const useAvailability = () => useQuery({ queryKey: availabilityKeys.all, queryFn: getAvailability });

export const useSaveAvailability = (onDone?: () => void) =>
  useAdminMutation({ mutationFn: saveAvailability, invalidate: [availabilityKeys.all], success: "sl8.saved", onSuccess: onDone });
