import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { approveStep, listApprovals } from "../api/approvalApi";
import type { Step } from "./types";

export const approvalKeys = { all: ["admin-approvals"] as const };

export const useApprovals = () => useQuery({ queryKey: [...approvalKeys.all, "list"], queryFn: listApprovals });

// Register requests share their record with approvals, so both modules are refreshed.
export const useApproveStep = () =>
  useAdminMutation({
    mutationFn: ({ id, step }: { id: string; step: Step }) => approveStep(id, step),
    invalidate: [approvalKeys.all, ["admin-reg"]],
    success: "admAppr.done",
  });
