import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/entities/session";
import { flushOutbox, pruneExpired, refreshOutboxCount, restoreQueries, setCacheScope, startPersisting, wipeAll } from "@/shared/cache";
import { registerSessionReset } from "@/shared/lib/sessionReset";

// Local cache lifecycle: the SQLite scope follows the signed-in user, allowed query snapshots are
// restored at start and written after each fetch, and the cache + unsent writes are wiped whenever the
// user or role changes or the user signs out (TZ 38, 40).
export function CacheMount() {
  const qc = useQueryClient();
  const userId = useSession()?.user.id ?? "";
  useEffect(() => registerSessionReset(() => void wipeAll()), []);
  useEffect(() => {
    setCacheScope(userId);
    if (!userId) {
      void refreshOutboxCount();
      return;
    }
    void pruneExpired();
    void restoreQueries(qc);
    void refreshOutboxCount().then(() => flushOutbox());
    return startPersisting(qc);
  }, [userId, qc]);
  return null;
}
