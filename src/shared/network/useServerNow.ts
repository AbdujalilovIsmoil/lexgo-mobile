import { useNow } from "@/shared/lib/pay/useNow";
import { useNetStore } from "./netStore";

// "Now" on the server's clock, re-read every `ms` while `active`: the countdown to a deadline the backend set (TZ §5 assignment answers)
// then reads the same on a phone whose clock is a few minutes off.
export function useServerNow(active: boolean, ms = 1000): number {
  const skew = useNetStore((s) => s.skewMs);
  return useNow(active, ms) + skew;
}
