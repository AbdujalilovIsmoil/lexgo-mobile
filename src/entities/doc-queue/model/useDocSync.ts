import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { docKeys } from "./keys";

const POOL = ["pool_created", "pool_removed", "claimed"];
const QUIET = ["pool_created", "pool_removed", "editor_saved", "meeting_created"];

// Realtime (document_request.*): refresh only what the event can have changed.
// `editor_saved` fires on every autosave and must not refetch anything.
export function useDocSync(): void {
  const qc = useQueryClient();
  const inv = (...key: string[]) => void qc.invalidateQueries({ queryKey: [...docKeys.all, ...key] });
  const all = () => ["pool", "list", "one"].forEach((k) => inv(k));
  useUserEvents("document_request.", (e) => {
    const name = e.event.slice("document_request.".length);
    if (POOL.includes(name)) inv("pool");
    if (!QUIET.includes(name)) ["list", "one"].forEach((k) => inv(k));
  });
  useResync(all);
}
