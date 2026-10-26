import { useNow } from "@/shared/lib/pay/useNow";

// Milliseconds left until an ISO deadline (0 once passed, -1 when there is no usable deadline). Display only:
// whether an action is still allowed is the backend's flag, never this clock.
export function useCountdown(iso: string): number {
  const end = Date.parse(iso);
  const now = useNow(!Number.isNaN(end), 1000, end);
  return Number.isNaN(end) ? -1 : Math.max(0, end - now);
}
