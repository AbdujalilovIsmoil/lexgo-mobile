import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { promotionKeys } from "@/entities/promotion";

// The promotion list refreshes itself: whenever the screen comes into focus and whenever the app returns to the foreground
// (the admin's Telegram answer usually arrives while the seller is elsewhere).
export function useAutoRefresh(): void {
  const qc = useQueryClient();
  const refresh = useCallback(() => {
    void qc.invalidateQueries({ queryKey: promotionKeys.all });
    void qc.invalidateQueries({ queryKey: ["pro-service"] });
  }, [qc]);
  useFocusEffect(refresh);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") refresh(); });
    return () => sub.remove();
  }, [refresh]);
}
