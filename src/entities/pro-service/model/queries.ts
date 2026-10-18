import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { addService, listServices, removeService, setServiceStatus, updateService } from "../api/serviceApi";
import { quoteBand } from "../api/priceApi";
import { scopeKey } from "../lib/rules";
import type { ServiceInput, ServiceScope, ServiceStatus } from "./types";

export const serviceKeys = { all: ["pro-service"] as const };
const ME: ServiceScope = { kind: "me" };

export const useProServices = (scope: ServiceScope = ME) =>
  useQuery({ queryKey: [...serviceKeys.all, scopeKey(scope), "list"], queryFn: () => listServices(scope) });

// Corridor for a service that is not in the list yet (10 min cache, like the web).
export const useQuoteBand = (serviceId: string, sellerId: string, region: string) =>
  useQuery({ queryKey: [...serviceKeys.all, "band", serviceId, sellerId, region], enabled: !!serviceId, staleTime: 10 * 60 * 1000, retry: false, queryFn: () => quoteBand(serviceId, sellerId, region) });

// Add / edit report their failure inside the form (serviceErrorOf), so no toast here.
export function useSaveService(scope: ServiceScope = ME) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, create }: { input: ServiceInput; create: boolean }) => (create ? addService(scope, input) : updateService(scope, input)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export const useServiceStatus = (scope: ServiceScope = ME) =>
  useAdminMutation({ mutationFn: ({ id, status }: { id: string; status: ServiceStatus }) => setServiceStatus(scope, id, status), invalidate: [serviceKeys.all], success: "sl6.statusSaved" });

export const useRemoveService = (scope: ServiceScope = ME) =>
  useAdminMutation({ mutationFn: (id: string) => removeService(scope, id), invalidate: [serviceKeys.all], success: "sl6.removed" });
