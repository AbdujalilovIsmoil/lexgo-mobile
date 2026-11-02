import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { deleteOffice, getConsent, getMapConfig, getOffice, putOffice, saveConsent } from "../api/mapApi";

export const mapKeys = { config: ["market-map", "config"] as const, consent: ["market-map", "consent"] as const, office: ["market-map", "office"] as const };

// Map config: once per session (the contract: cache categories, meta and map config for the session).
export const useMapConfig = () => useQuery({ queryKey: mapKeys.config, queryFn: getMapConfig, staleTime: Infinity, gcTime: Infinity, retry: 1 });

export const useConsent = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: mapKeys.consent, queryFn: getConsent, enabled: authed, retry: false });
};
export const useSaveConsent = () => useAdminMutation({ mutationFn: saveConsent, invalidate: [mapKeys.consent] });

export const useOffice = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: mapKeys.office, queryFn: getOffice, enabled: authed, retry: false });
};
export const usePutOffice = () => useAdminMutation({ mutationFn: putOffice, invalidate: [mapKeys.office], success: "mmap.office.saved" });
export const useDeleteOffice = () => useAdminMutation({ mutationFn: deleteOffice, invalidate: [mapKeys.office], success: "mmap.office.removed" });
