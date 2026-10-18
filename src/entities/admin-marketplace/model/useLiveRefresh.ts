import { useCallback } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { mktKeys } from "./queries";

const EVERY_MS = 60_000;

// Live monitor: while the screen is focused and the app is in the foreground, refetch the active queries every minute.
export function useLiveRefresh() {
  const qc = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(() => {
        if (AppState.currentState === "active") void qc.refetchQueries({ queryKey: mktKeys.all, type: "active" });
      }, EVERY_MS);
      return () => clearInterval(id);
    }, [qc]),
  );
}
