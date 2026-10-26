import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNow } from "@/shared/lib/pay/useNow";
import type { MarketOrder } from "./marketTypes";

// TZ §10: the 15-minute rating window of a finished order, counted down from the backend's remaining_seconds (or its deadline). When it
// runs out the rating controls go away at once and the order is read again — the server has the last word. `left` is null when the
// backend sent no countdown at all (the window is open until the server says otherwise).
export function useRatingWindow(o: MarketOrder): { open: boolean; left: number | null } {
  const qc = useQueryClient();
  const r = o.rating;
  const available = !!r && r.available && !o.ratingSubmitted && !o.ratingStars;
  const now = useNow(available);
  const end = !r ? 0 : r.remainingSeconds > 0 ? r.fetchedAt + r.remainingSeconds * 1000 : Date.parse(r.deadlineAt) || 0;
  const left = available && end ? Math.max(0, end - now) : null;
  const expired = left === 0;
  useEffect(() => {
    if (expired) void qc.invalidateQueries({ queryKey: ["market-orders"] });
  }, [expired, qc]);
  return { open: available && !expired, left };
}
