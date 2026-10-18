import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { secKeys } from "@/entities/security";
import { authApi, useSessionStore } from "@/entities/session";

// After a security change: re-read /auth/me into the stored profile (twoFactorEnabled …)
// and refetch the screen's status query. Never throws.
export function useSyncProfile() {
  const qc = useQueryClient();
  return useCallback(async () => {
    try {
      const u = await authApi.me();
      const cur = useSessionStore.getState().session?.user;
      if (cur && u.id === cur.id) await useSessionStore.getState().setUser({ ...cur, ...u, telegramLinked: u.telegramLinked ?? cur.telegramLinked });
    } catch {
      /* the status query below still shows the server's answer */
    }
    await qc.invalidateQueries({ queryKey: secKeys.profile });
  }, [qc]);
}
