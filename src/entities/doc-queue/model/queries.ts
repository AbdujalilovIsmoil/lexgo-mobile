import { useQuery } from "@tanstack/react-query";
import { asDict } from "@/shared/lib/json";
import { http } from "@/shared/api";
import { getMyDoc, listCandidates, listMyDocs, listPool } from "../api/queueApi";
import { docKeys } from "./keys";

// `all` = no server-side filter (everything but the still-open pool items, which live in the pool).
export const useDocs = (tab: string) =>
  useQuery({ queryKey: docKeys.list(tab), queryFn: async () => (await listMyDocs(tab === "all" ? "" : tab)).filter((d) => tab !== "all" || d.status !== "open_pool") });
export const useDoc = (id: string) => useQuery({ queryKey: docKeys.one(id), queryFn: () => getMyDoc(id), enabled: !!id });
export const usePool = (enabled = true) => useQuery({ queryKey: docKeys.pool, queryFn: listPool, enabled });
export const useCandidates = (enabled: boolean) => useQuery({ queryKey: docKeys.candidates, queryFn: listCandidates, enabled, staleTime: 5 * 60_000 });

// What the client rated the finished document (best effort: the client-owned endpoint may be closed to us).
export function useDocRating(documentRequestId: string, enabled: boolean) {
  return useQuery({
    queryKey: docKeys.rating(documentRequestId),
    enabled: enabled && !!documentRequestId,
    retry: false,
    queryFn: async () => {
      const d = asDict(await http(`/document-requests/${encodeURIComponent(documentRequestId)}`));
      const r = asDict(d.rating);
      return { submitted: d.rating_submitted === true, available: d.rating_available === true, stars: Number(r.rating) || 0, comment: typeof r.comment === "string" ? r.comment : "", deadline: typeof d.rating_deadline_at === "string" ? d.rating_deadline_at : "" };
    },
  });
}
