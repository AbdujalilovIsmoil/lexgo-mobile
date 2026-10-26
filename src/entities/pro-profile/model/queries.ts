import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getAccount, getMyProfile, getPublicProfile, requestVerification, saveAccount, saveProfile } from "../api/profileApi";
import type { ProAccount, ProProfile, ProfileFields } from "./types";

export const proProfileKeys = {
  all: ["pro-profile"] as const,
  me: ["pro-profile", "me"] as const,
  account: ["pro-profile", "account"] as const,
  pub: (id: string) => ["pro-profile", "public", id] as const,
};

export const useMyProfile = () => useQuery({ queryKey: proProfileKeys.me, queryFn: getMyProfile });
export const useAccount = () => useQuery({ queryKey: proProfileKeys.account, queryFn: getAccount });

// 404 = "not listed in the marketplace (yet)": that is an answer, not an error.
export const usePublicProfile = (userId: string) =>
  useQuery({
    queryKey: proProfileKeys.pub(userId),
    enabled: !!userId,
    retry: false,
    queryFn: async (): Promise<ProProfile | null> => {
      try {
        return await getPublicProfile(userId);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return null;
        throw e;
      }
    },
  });

export const useSaveProfile = (onDone?: () => void) =>
  useAdminMutation({
    mutationFn: ({ cur, patch }: { cur: ProProfile; patch: Partial<ProfileFields> }) => saveProfile(cur, patch),
    invalidate: [proProfileKeys.all],
    success: "adm.saved",
    onSuccess: onDone,
  });

export const useSaveAccount = (onDone?: () => void) =>
  useAdminMutation({
    mutationFn: (patch: Partial<Pick<ProAccount, "name" | "email" | "avatarUrl">>) => saveAccount(patch),
    invalidate: [proProfileKeys.all],
    success: "adm.saved",
    onSuccess: onDone,
  });

export const useRequestVerification = () =>
  useAdminMutation({ mutationFn: requestVerification, invalidate: [proProfileKeys.all, ["pro-onboarding"], ["pro-workspace", "cabinet"]], success: "sl4.verify.sent" });
