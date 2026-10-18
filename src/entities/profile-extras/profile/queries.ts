import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getProfile } from "./api";

export const profileKey = ["pay-profile"] as const;

export const useClientProfile = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: profileKey, queryFn: getProfile, enabled: authed, staleTime: 60 * 1000 });
};
