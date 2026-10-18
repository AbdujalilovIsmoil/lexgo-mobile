import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getReferral } from "../api/referralApi";

export const referralKeys = { all: ["pro-referral"] as const };

export const useReferral = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: referralKeys.all, queryFn: getReferral, enabled: authed });
};
