import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useCabinetSlice, wsKeys, type Cabinet } from "@/entities/pro-workspace";
import { getProgress, listDocs, submitOnboarding, uploadDoc } from "../api/onboardingApi";
import type { ProCabinet } from "./types";

export const onboardingKeys = { all: ["pro-onboarding"] as const };

// The onboarding's view of the shared cabinet (GET /lawyers/me/cabinet is read once, by pro-workspace).
const proCabinetOf = (c: Cabinet): ProCabinet => ({
  accountStatus: c.accountStatus.toLowerCase(),
  sellerType: c.sellerType.toLowerCase(),
  limitedAccess: c.limited,
  limitedReason: c.limitedReason,
  actions: c.actions,
  verificationStatus: c.verification.toLowerCase(),
  verified: c.verified,
});
export const useCabinet = () => useCabinetSlice(proCabinetOf);
export const useProgress = () => useQuery({ queryKey: [...onboardingKeys.all, "progress"], queryFn: getProgress });
export const useDocs = () => useQuery({ queryKey: [...onboardingKeys.all, "docs"], queryFn: listDocs });

export const useUploadDoc = (onDone?: () => void) =>
  useAdminMutation({
    mutationFn: (v: { file: { uri: string; name: string }; kind: string }) => uploadDoc(v.file, v.kind),
    invalidate: [onboardingKeys.all, wsKeys.cabinet],
    success: "sl3.docs.uploaded",
    onSuccess: onDone,
  });

export const useSubmitOnboarding = () =>
  useAdminMutation({ mutationFn: submitOnboarding, invalidate: [onboardingKeys.all, wsKeys.cabinet], success: "sl3.submit.done" });
