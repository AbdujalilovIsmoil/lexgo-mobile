import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { workKeys } from "./queries";

// User-channel events that change a work row (TZ 37.1): documents, urgent requests,
// marketplace orders, cases, ratings, complaints, payments, plus notifications.
const EVENTS = ["document_request.", "urgent_advokat.", "quality_complaint.", "marketplace.", "order.", "case.", "rating.", "complaint.", "payment.", "notification.created"];

// Refetches the works queries (debounced) when the socket reports a change or reconnects,
// and any stale ones when the screen comes back into focus.
export function useWorksRealtime(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kick = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void qc.invalidateQueries({ queryKey: workKeys.all }), 700);
  }, [qc]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useFocusEffect(useCallback(() => void qc.refetchQueries({ queryKey: workKeys.all, stale: true, type: "active" }), [qc]));
  useUserEvents(EVENTS, kick);
  useResync(kick);
}
