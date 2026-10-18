import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { assignNextSeller, getQueue, moveCcLead } from "../api/queueApi";
import { ccKeys, QUEUE_MS } from "./keys";
import { useLiveMs } from "./useLiveMs";

// Leads, unassigned orders and urgent requests; refreshed every minute like on the web.
export const useQueue = () => useQuery({ queryKey: ccKeys.queue, queryFn: getQueue, refetchInterval: useLiveMs(QUEUE_MS) });

export const useAssignNext = () => useAdminMutation({ mutationFn: assignNextSeller, invalidate: [ccKeys.queue], success: "admCc.assigned" });

export const useMoveQueueLead = () =>
  useAdminMutation({ mutationFn: ({ id, key }: { id: string; key: string }) => moveCcLead(id, key), invalidate: [ccKeys.queue, ccKeys.board], success: "admCc.moved" });
