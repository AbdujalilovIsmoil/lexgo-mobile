import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { getConsent, listConsents } from "./api";

export const consentsKey = ["pay-consents"] as const;

export const useConsents = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: consentsKey, queryFn: listConsents, enabled: authed, staleTime: 60 * 1000 });
};

export const useConsentDoc = (id: string | null) => useQuery({ queryKey: [...consentsKey, id], queryFn: () => getConsent(id ?? ""), enabled: !!id, staleTime: 10 * 60 * 1000 });
