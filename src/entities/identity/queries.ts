import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getIdentity } from "./api";

export const identityKey = ["identity-me"] as const;

export const useIdentity = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: identityKey, queryFn: () => getIdentity().catch(() => null), enabled: authed, staleTime: 30_000 });
};
