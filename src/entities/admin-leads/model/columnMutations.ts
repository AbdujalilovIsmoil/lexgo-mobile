import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { deleteColumn, saveColumns } from "../api/columnApi";
import { leadKeys } from "./queries";
import { useLeadScope } from "./scope";
import type { ColumnInput } from "./types";

// Add / rename / recolor / reorder statuses (upsert by key; the list is merged server-side).
export function useSaveColumns(success = "adm.saved") {
  const scope = useLeadScope();
  return useAdminMutation({ mutationFn: (cols: ColumnInput[]) => saveColumns(scope, cols), invalidate: [leadKeys.boards], success });
}

export function useSaveColumn() {
  const save = useSaveColumns();
  return { ...save, mutate: (c: ColumnInput, o?: { onSuccess?: () => void }) => save.mutate([c], o) };
}

// Delete a status; its leads move to `reassignTo` first.
export const useDeleteColumn = () =>
  useAdminMutation({ mutationFn: ({ key, reassignTo }: { key: string; reassignTo?: string }) => deleteColumn(key, reassignTo), invalidate: [leadKeys.boards], success: "adm.deleted" });
