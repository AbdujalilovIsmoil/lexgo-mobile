import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { saveColumns } from "../api/columnApi";
import { leadKeys } from "./queries";
import { columnInputs, movedColumns } from "./reorder";
import { useLeadScope } from "./scope";
import type { Column } from "./types";
import { useBoardCache } from "./useBoardCache";

// Move a status up / down: the board reorders at once and goes back when the server refuses.
export function useMoveColumn(cols: Column[]) {
  const scope = useLeadScope();
  const cache = useBoardCache();
  return useAdminMutation({
    mutationFn: async ({ key, dir }: { key: string; dir: -1 | 1 }) => {
      const next = movedColumns(cols, key, dir);
      if (next === cols) return;
      const snap = cache.read();
      cache.write(() => next);
      try {
        await saveColumns(scope, columnInputs(next));
      } catch (e) {
        cache.restore(snap);
        throw e;
      }
    },
    invalidate: [leadKeys.boards],
  });
}
