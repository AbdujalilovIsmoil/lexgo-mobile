import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { isReviewEvent, REVIEW_EVENTS } from "../lib/events";
import { achKeys } from "./queries";

// While the achievements screen is open, a decision of the call center — or a reconnect, after which missed events are gone — reads the
// list again. The event and its notification usually come together: one read after a short settle.
export function useAchievementsLive(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refresh = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void qc.invalidateQueries({ queryKey: achKeys.all }), 400);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useUserEvents([...REVIEW_EVENTS, "notification.created"], (e) => {
    if (isReviewEvent(e)) refresh();
  });
  useResync(refresh);
}
