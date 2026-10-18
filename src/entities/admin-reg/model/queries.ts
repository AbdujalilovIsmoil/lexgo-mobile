import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getRegDetail } from "../api/detailApi";
import { fetchProof } from "../api/proofApi";
import { acceptRequest, listSellerRequests, rejectRequest } from "../api/sellerApi";
import type { SellerFilter } from "./types";

export const regKeys = { all: ["admin-reg"] as const };
// Approvals (/approvals) mirror these requests, so a decision refreshes both modules.
const refresh = [regKeys.all, ["admin-approvals"]];

export const useSellerRequests = (f: SellerFilter) => useQuery({ queryKey: [...regKeys.all, "list", f], queryFn: () => listSellerRequests(f), placeholderData: keepPreviousData });
export const useRegDetail = (id: string | null) => useQuery({ queryKey: [...regKeys.all, "detail", id], queryFn: () => getRegDetail(id ?? ""), enabled: !!id });
export const useProofFile = (id: string, enabled: boolean) => useQuery({ queryKey: [...regKeys.all, "proof", id], queryFn: () => fetchProof(id), enabled, staleTime: Infinity, retry: 0 });

export const useAcceptRequest = () => useAdminMutation({ mutationFn: acceptRequest, invalidate: refresh, success: "admReg.acceptedDone" });
export const useRejectRequest = () => useAdminMutation({ mutationFn: rejectRequest, invalidate: refresh, success: "admReg.rejectedDone" });
