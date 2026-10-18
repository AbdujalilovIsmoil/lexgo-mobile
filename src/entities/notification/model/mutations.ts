import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { markAllRead, markRead } from "../api/notificationApi";
import { markRowsRead } from "./cache";
import { notificationKeys } from "./keys";
import type { Notification } from "./types";

// Both update the cached rows first (the dot and the badge drop at once), then call the server;
// a failure refetches the truth and says why.
function useReadMutation<V>(call: (v: V) => Promise<void>, rowIds: (v: V) => string[] | null) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: call,
    onMutate: (v: V) => markRowsRead(qc, rowIds(v)),
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail && e.status !== 0 ? e.detail : t("nt1.readFailed"), "err");
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: notificationKeys.unread }),
  });
}

export const useMarkAllRead = () => useReadMutation<void>(markAllRead, () => null);
export const useMarkRead = () => useReadMutation<Notification>((n) => markRead(n.ids), (n) => n.ids);
export const useMarkMany = () =>
  useReadMutation<Notification[]>((ns) => markRead(ns.flatMap((n) => n.ids)), (ns) => ns.flatMap((n) => n.ids));

// Read-by-id for code outside screens (a tapped OS notification): cache first, then the server.
export async function markIdsRead(qc: QueryClient, ids: string[]): Promise<void> {
  if (!ids.length) return;
  markRowsRead(qc, ids);
  try {
    await markRead(ids);
  } catch {
    /* the next refetch settles it */
  }
  void qc.invalidateQueries({ queryKey: notificationKeys.unread });
}
