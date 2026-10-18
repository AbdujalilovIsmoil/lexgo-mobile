import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listFamily } from "./api";

export const familyKey = ["pay-family"] as const;

export const useFamily = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: familyKey, queryFn: listFamily, enabled: authed, staleTime: 60 * 1000 });
};
