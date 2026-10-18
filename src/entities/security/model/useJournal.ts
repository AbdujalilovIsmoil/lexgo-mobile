import { useMemo } from "react";
import { useActivity, useSecurityEvents } from "./queries";
import { mergeJournal } from "../lib/journal";

// Audit log + security events as one newest-first list. The events endpoint is optional (failures read as "none"),
// so loading/error follow the audit log; refetch and the pull-to-refresh spinner cover both.
export function useJournal() {
  const a = useActivity();
  const e = useSecurityEvents();
  const all = useMemo(() => mergeJournal(a.data ?? [], e.data ?? []), [a.data, e.data]);
  return {
    all,
    isLoading: a.isLoading,
    isError: a.isError,
    error: a.error,
    isRefetching: a.isRefetching || e.isRefetching,
    refetch: () => Promise.all([a.refetch(), e.refetch()]),
  };
}
