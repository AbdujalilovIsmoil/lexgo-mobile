import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useResync, useSocketState, useUserEvents } from "@/shared/realtime";
import { hrmKeys } from "./keys";

// Reference lists (names for ids) change rarely; live refreshes skip them, pull-to-refresh does not.
const REFERENCE = new Set(["employees", "positions", "board"]);

// Realtime for the HRM screens (TZ 37.4): every "internal.*" event on the user socket refetches the active HRM
// queries (bursts are merged), and so does a reconnect. Only while the socket stays down does a slow poll
// (every `fallbackMs`, screen focused, app in the foreground) take over.
export function useLive(fallbackMs = 30_000) {
  const qc = useQueryClient();
  const state = useSocketState();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refetch = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void qc.refetchQueries({ queryKey: hrmKeys.all, type: "active", predicate: (q) => !REFERENCE.has(String(q.queryKey[1])) });
    }, 350);
  }, [qc]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useUserEvents("internal.", refetch);
  useResync(refetch);
  useFocusEffect(
    useCallback(() => {
      if (state === "online") return;
      const id = setInterval(() => AppState.currentState === "active" && refetch(), fallbackMs);
      return () => clearInterval(id);
    }, [state, fallbackMs, refetch]),
  );
}

// Pull-to-refresh of a whole screen: every active HRM query is refetched.
export function useRefreshAll() {
  const qc = useQueryClient();
  return useCallback(() => void qc.refetchQueries({ queryKey: hrmKeys.all, type: "active" }), [qc]);
}
