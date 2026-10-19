import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, useSessionStore } from "@/entities/session";
import { cacheScope, flushOutbox, pruneExpired, purgeOtherScopes, refreshOutboxCount, restoreQueries, setCacheScope, startPersisting, wipeAll, wipeKeepingOutbox } from "@/shared/cache";
import { registerSessionReset } from "@/shared/lib/sessionReset";

// Local cache lifecycle: the SQLite scope follows the signed-in user, allowed query snapshots are
// restored at start and written after each fetch, and the cache + unsent writes are wiped whenever the
// user or role changes or the user signs out (TZ 38, 40). Exception: when the SERVER ended the session
// (expired/revoked refresh token) that account's unsent writes are kept for its next sign-in.
export function CacheMount() {
  const qc = useQueryClient();
  const userId = useSession()?.user.id ?? "";
  useEffect(
    () =>
      registerSessionReset(() => {
        const st = useSessionStore.getState();
        const scope = cacheScope(); // still the leaving account: the cleaners run before React re-renders
        if (!st.session && st.notice === "sessionExpired" && scope) void wipeKeepingOutbox(scope);
        else void wipeAll();
      }),
    [],
  );
  useEffect(() => {
    setCacheScope(userId);
    if (!userId) {
      void refreshOutboxCount();
      return;
    }
    void purgeOtherScopes(userId);
    // Sliced and size-capped (see restoreQueries): it yields to the UI between slices and stops by itself when the
    // account changes, so it starts at once — the sooner saved data is back, the fewer screens wait offline.
    void restoreQueries(qc);
    void refreshOutboxCount().then(() => flushOutbox());
    void pruneExpired();
    return startPersisting(qc);
  }, [userId, qc]);
  return null;
}
