import { msLeft, windowOpen, type RatingWindow } from "@/entities/rating";
import { mmss } from "@/shared/lib/format";
import { useNow } from "@/shared/lib/pay/useNow";

// Countdown of the rating window, drawn from the server's own remaining seconds (never from the
// phone's clock alone). `open` is the backend's answer AND time still left; `left` ticks every second.
export function useCountdown(w: RatingWindow | null): { open: boolean; left: number; label: string } {
  const active = !!w && windowOpen(w);
  const now = useNow(active);
  const left = w && active ? msLeft(w, now) : 0;
  return { open: active && left > 0, left, label: mmss(left) };
}
