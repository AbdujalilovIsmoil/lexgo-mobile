import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { toast } from "@/shared/ui";
import { getBoard, listOperators } from "../api/boardApi";
import { assignLead, saveLostReason } from "../api/leadWriteApi";
import { moveCcLead } from "../api/queueApi";
import { moveInBoard } from "./boardFilter";
import type { BoardColumn, BoardLead } from "./boardTypes";
import { ccKeys } from "./keys";

export const useBoard = () => useQuery({ queryKey: [...ccKeys.board, "columns"], queryFn: getBoard });

// GET /admin/users needs users.manage; without it the operator directory is simply unavailable (403).
export const useOperators = () => useQuery({ queryKey: [...ccKeys.board, "operators"], queryFn: listOperators, retry: false, staleTime: 5 * 60_000 });

type MoveVars = { lead: BoardLead; key: string; lost?: { reason: string; note: string } };

// The card moves at once; a rejected move is rolled back and the server's message shown.
export function useMoveLead() {
  const qc = useQueryClient();
  const { t } = useT();
  const key = [...ccKeys.board, "columns"];
  return useMutation({
    mutationFn: async ({ lead, key: to, lost }: MoveVars) => {
      if (lost) await saveLostReason(lead, lost.reason, lost.note).catch(() => undefined);
      await moveCcLead(lead.id, to);
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<BoardColumn[]>(key);
      if (prev) qc.setQueryData(key, moveInBoard(prev, v.lead.id, v.key));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
    onSuccess: () => {
      successHaptic();
      toast(t("admCc.moved"), "ok");
    },
    onSettled: () => void Promise.all([ccKeys.board, ccKeys.queue].map((queryKey) => qc.invalidateQueries({ queryKey }))),
  });
}

export const useAssignLead = () =>
  useAdminMutation({
    mutationFn: ({ lead, userId, byUserId }: { lead: BoardLead; userId: string; byUserId: string }) => assignLead(lead, userId, byUserId),
    invalidate: [ccKeys.board],
    success: "admCcB.assignedLead",
  });
