import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { statsKeys } from "./queries";

const EVENTS = ["document_request.", "payment.", "marketplace.", "order.", "subscription.", "secure_chat.", "urgent_advokat.", "notification.created"];

// Keeps the Home counters fresh: a user-channel event or a reconnect refetches them (debounced),
// and stale ones are refetched when Home regains focus.
export function useStatsRealtime(): void {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kick = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void qc.invalidateQueries({ queryKey: statsKeys.all });
      void qc.invalidateQueries({ queryKey: ["entitlements"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
    }, 700);
  }, [qc]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  useFocusEffect(useCallback(() => {
    for (const key of [statsKeys.all, ["entitlements"], ["orders"]]) void qc.refetchQueries({ queryKey: key, stale: true, type: "active" });
  }, [qc]));
  useUserEvents(EVENTS, kick);
  useResync(kick);
}
