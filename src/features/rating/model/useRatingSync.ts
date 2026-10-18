import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ratingKeys } from "@/entities/rating";
import { useResync, useUserEvents } from "@/shared/realtime";

// Anything that can finish a piece of work (completion, a result file, a moved request) or change a
// complaint. The user socket tells us; a debounced REST read then finds the open rating windows.
const EVENTS = ["document_request.", "urgent_advokat.", "order.", "quality_complaint.", "complaint.", "notification.created"];
const MIN_GAP_MS = 15000;

export function useRatingSync(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const last = useRef(0);
  const scan = useCallback(() => {
    clearTimeout(timer.current);
    // At most one scan per MIN_GAP_MS, however chatty the socket is.
    const wait = Math.max(1200, last.current + MIN_GAP_MS - Date.now());
    timer.current = setTimeout(() => {
      last.current = Date.now();
      void qc.invalidateQueries({ queryKey: ratingKeys.open });
      void qc.invalidateQueries({ queryKey: ratingKeys.complaints });
      void qc.invalidateQueries({ queryKey: ["rate-pending"] });
    }, wait);
  }, [qc]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents(EVENTS, scan);
  useResync(scan);
}
