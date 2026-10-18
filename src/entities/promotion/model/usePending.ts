import { useCallback, useMemo } from "react";
import { usePendingStore, pendingOf } from "./pendingStore";
import type { PendingPromo } from "./types";

// Checkouts of this seller that wait for the Telegram approval (shown as "pending", never as paid).
export function usePending(uid: string) {
  const items = usePendingStore((s) => s.items);
  const put = usePendingStore((s) => s.put);
  return { pending: useMemo(() => pendingOf(items, uid), [items, uid]), add: useCallback((p: PendingPromo) => put(uid, p), [put, uid]) };
}
