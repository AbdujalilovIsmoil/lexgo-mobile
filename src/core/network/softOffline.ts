import type { QueryClient } from "@tanstack/react-query";
import { isOfflineError } from "@/shared/api";

/** A failed refetch is "soft" when the request never reached the server and the query still holds data. */
export const isSoftFailure = (error: unknown, hasData: boolean): boolean => hasData && isOfflineError(error);

// TanStack marks a query as `error` when a refetch fails even though it still holds data, and screens that test
// `isError` then replace good (cached) content with an error view. For offline failures the status goes back to
// `success`: the data stays on screen (with the offline pill), the query stays stale and reloads on reconnect.
// Server errors (4xx/5xx) are real news and keep the normal error flow.
export function startSoftOffline(qc: QueryClient): () => void {
  return qc.getQueryCache().subscribe((e) => {
    if (e.type !== "updated" || e.action.type !== "error") return;
    if (isSoftFailure(e.action.error, e.query.state.data !== undefined)) e.query.setState({ status: "success", error: null });
  });
}
