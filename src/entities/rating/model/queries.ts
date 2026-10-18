import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getComplaintDetail, getWorkRef, listComplaints, listComplaintTargets } from "../api/complaintApi";
import { listMyReviews, listPendingReviews } from "../api/reviewApi";
import { scanOpenWindows } from "../api/scanApi";
import { getRateTarget } from "../api/targetApi";
import { listReplacements, listWarranty } from "../api/warrantyApi";
import type { ComplaintItem } from "./complaint";

export const ratingKeys = { target: (id: string) => ["rate-target", id] as const, complaints: ["rate-complaints"] as const, open: ["rate-open"] as const };

export const useRateTarget = (workId: string) => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ratingKeys.target(workId), queryFn: () => getRateTarget(workId), enabled: authed && !!workId, staleTime: 0, gcTime: 60 * 1000 });
};

export const useComplaints = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ratingKeys.complaints, queryFn: listComplaints, enabled: authed, staleTime: 30 * 1000 });
};

export const useComplaintDetail = (c: ComplaintItem | null) =>
  useQuery({ queryKey: [...ratingKeys.complaints, "detail", c?.id], queryFn: () => getComplaintDetail(c as ComplaintItem), enabled: !!c && c.kind === "quality", staleTime: 30 * 1000 });

export const useWorkRef = (ref: string) => useQuery({ queryKey: ["rate-workref", ref], queryFn: () => getWorkRef(ref), enabled: !!ref, staleTime: 5 * 60 * 1000 });

export const useComplaintTargets = (enabled: boolean) => useQuery({ queryKey: ["rate-targets"], queryFn: listComplaintTargets, enabled, staleTime: 2 * 60 * 1000 });

export const useOpenWindows = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ratingKeys.open, queryFn: scanOpenWindows, enabled: authed, staleTime: 20 * 1000, retry: false });
};

export const useMyReviews = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ["rate-reviews"], queryFn: listMyReviews, enabled: authed, staleTime: 60 * 1000 });
};

export const usePendingReviews = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ["rate-pending"], queryFn: listPendingReviews, enabled: authed, staleTime: 60 * 1000 });
};

export const useWarranty = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ["rate-warranty"], queryFn: async () => ({ claims: await listWarranty(), replacements: await listReplacements().catch(() => []) }), enabled: authed, staleTime: 60 * 1000 });
};
