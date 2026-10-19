import { onlineManager, type QueryClient } from "@tanstack/react-query";
import { ApiError, isOfflineError } from "@/shared/api";
import { whenRestored } from "@/shared/cache";

/** A failed refetch is "soft" when the request never reached the server and the query still holds data. */
export const isSoftFailure = (error: unknown, hasData: boolean): boolean => hasData && isOfflineError(error);

type StallState = { status: string; data: unknown; fetchStatus: string; fetchFailureReason: unknown };

/**
 * A first load that paused for lack of a connection and has nothing to show. TanStack keeps such a query `pending`
 * with fetchStatus `paused` for as long as the device is offline: screens keyed on `isPending` spin for ever and
 * screens keyed on `isLoading` (false while paused) draw their "nothing here yet" empty state — both wrong.
 */
export const isOfflineStall = (s: StallState, online: boolean): boolean =>
  s.data === undefined && s.status === "pending" && s.fetchStatus === "paused" && (!online || isOfflineError(s.fetchFailureReason));

// 1) TanStack marks a query as `error` when a refetch fails even though it still holds data, and screens that test
// `isError` then replace good (cached) content with an error view. For offline failures the status goes back to
// `success`: the data stays on screen (with the offline pill), the query stays stale and reloads on reconnect.
// Server errors (4xx/5xx) are real news and keep the normal error flow.
// 2) A first load stalled offline (isOfflineStall) is shown as a "no internet" error instead (ErrorView draws it as
// such, with a retry) — but only after the start-up restore from disk had its chance to fill it. The paused fetch
// itself stays alive: when the connection returns it continues and the screen fills in by itself.
export function startSoftOffline(qc: QueryClient): () => void {
  return qc.getQueryCache().subscribe((e) => {
    if (e.type !== "updated") return;
    const q = e.query;
    if (e.action.type === "error") {
      if (isSoftFailure(e.action.error, q.state.data !== undefined)) q.setState({ status: "success", error: null });
      return;
    }
    if (e.action.type !== "pause" || !isOfflineStall(q.state, onlineManager.isOnline())) return;
    void whenRestored().then(() => {
      if (isOfflineStall(q.state, onlineManager.isOnline())) q.setState({ status: "error", error: new ApiError(0, "offline"), errorUpdatedAt: Date.now() });
    });
  });
}
