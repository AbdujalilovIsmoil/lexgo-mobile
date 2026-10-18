import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getReferral } from "./api";

export const useReferral = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ["pay-referral"], queryFn: getReferral, enabled: authed, staleTime: 60 * 1000 });
};
