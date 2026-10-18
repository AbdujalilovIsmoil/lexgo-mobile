import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { fetchContract } from "../api/instructorApi";

// The assistant's contract for this user. A 403/404 means "not available for this role/build": no retries,
// and the launcher stays hidden.
export function useInstructorContract(enabled: boolean, userKey: string) {
  return useQuery({
    queryKey: ["instructor-contract", userKey],
    queryFn: fetchContract,
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: (n, e) => !(e instanceof ApiError && [401, 403, 404].includes(e.status)) && n < 2,
  });
}
