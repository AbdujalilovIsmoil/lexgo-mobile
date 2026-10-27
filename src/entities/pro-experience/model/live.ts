import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { isReviewEvent, REVIEW_EVENTS } from "../lib/events";
import { expKeys } from "./queries";

// While the experience screen is open, a decision of the call center (§3.13) — or a reconnect, after which missed events are gone —
// reads the list and an open history again. The event and its notification usually come together: one read after a short settle.
export function useExperienceLive(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refresh = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void qc.invalidateQueries({ queryKey: expKeys.all }), 400);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useUserEvents([...REVIEW_EVENTS, "notification.created"], (e) => {
    if (isReviewEvent(e)) refresh();
  });
  useResync(refresh);
}
