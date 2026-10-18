import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { leadKeys } from "./queries";
import { useLeadScope } from "./scope";
import type { Column } from "./types";

// Read / patch / roll back the cached board, for optimistic updates.
export function useBoardCache() {
  const qc = useQueryClient();
  const key = leadKeys.board(useLeadScope());
  return useMemo(
    () => ({
      read: () => qc.getQueryData<Column[]>(key),
      write: (fn: (cols: Column[]) => Column[]) => qc.setQueryData<Column[]>(key, (cur) => (cur ? fn(cur) : cur)),
      restore: (snap: Column[] | undefined) => snap && qc.setQueryData<Column[]>(key, snap),
    }),
    [qc, key],
  );
}
