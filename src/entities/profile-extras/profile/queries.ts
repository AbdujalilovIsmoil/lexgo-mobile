import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getProfile } from "./api";

export const profileKey = ["pay-profile"] as const;

// `enabled` lets a shared screen (the header) ask only for a client — /clients/me is the client's own record.
export const useClientProfile = (enabled = true) => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: profileKey, queryFn: getProfile, enabled: authed && enabled, staleTime: 60 * 1000 });
};
