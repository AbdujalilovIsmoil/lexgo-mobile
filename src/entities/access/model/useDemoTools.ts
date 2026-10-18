import { useQuery } from "@tanstack/react-query";
import { http } from "@/shared/api";
import { useAccess } from "./useAccess";

// Staging-only tools (Test OTP …) exist where the backend still serves /admin/test-otps;
// in production that route is a 404, so the entries stay hidden.
export function useDemoTools(): boolean {
  const a = useAccess();
  const { data } = useQuery({
    queryKey: ["demo-tools"],
    enabled: a.admin && a.can(),
    retry: false,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      try {
        await http("/admin/test-otps");
        return true;
      } catch {
        return false;
      }
    },
  });
  return data === true;
}
