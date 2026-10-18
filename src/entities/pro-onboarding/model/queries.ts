import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getCabinet, getProgress, listDocs, submitOnboarding, uploadDoc } from "../api/onboardingApi";

export const onboardingKeys = { all: ["pro-onboarding"] as const };

export const useCabinet = () => useQuery({ queryKey: [...onboardingKeys.all, "cabinet"], queryFn: getCabinet });
export const useProgress = () => useQuery({ queryKey: [...onboardingKeys.all, "progress"], queryFn: getProgress });
export const useDocs = () => useQuery({ queryKey: [...onboardingKeys.all, "docs"], queryFn: listDocs });

export const useUploadDoc = (onDone?: () => void) =>
  useAdminMutation({
    mutationFn: (v: { file: { uri: string; name: string }; kind: string }) => uploadDoc(v.file, v.kind),
    invalidate: [onboardingKeys.all],
    success: "sl3.docs.uploaded",
    onSuccess: onDone,
  });

export const useSubmitOnboarding = () =>
  useAdminMutation({ mutationFn: submitOnboarding, invalidate: [onboardingKeys.all], success: "sl3.submit.done" });
