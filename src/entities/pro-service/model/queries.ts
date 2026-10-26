import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { addService, listServices, removeService, setServiceStatus, updateService } from "../api/serviceApi";
import { quoteBand } from "../api/priceApi";
import type { ProServices, ServiceInput, ServiceStatus } from "./types";

export const serviceKeys = { all: ["pro-service"] as const, list: ["pro-service", "me", "list"] as const };

export const useProServices = () => useQuery({ queryKey: serviceKeys.list, queryFn: listServices });

// Corridor for a service that is not in the list yet (10 min cache, like the web).
export const useQuoteBand = (serviceId: string, sellerId: string, region: string) =>
  useQuery({ queryKey: [...serviceKeys.all, "band", serviceId, sellerId, region], enabled: !!serviceId, staleTime: 10 * 60 * 1000, retry: false, queryFn: () => quoteBand(serviceId, sellerId, region) });

// Add / edit report their failure inside the form (serviceErrorOf), so no toast here.
export function useSaveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, create }: { input: ServiceInput; create: boolean }) => (create ? addService(input) : updateService(input)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

// The switch moves at once (the cached list is patched) and goes back if the server refuses; the list is refetched afterwards because
// "visible in the marketplace" is the server's call. The toast names the new state ("Xizmat pauzaga qo'yildi").
export function useServiceStatus() {
  const { t } = useT();
  const qc = useQueryClient();
  const key = serviceKeys.list;
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceStatus }) => setServiceStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ProServices>(key);
      qc.setQueryData<ProServices>(key, (d) => (d ? { ...d, items: d.items.map((x) => (x.id === id ? { ...x, status, visible: status === "active" && x.visible } : x)) } : d));
      return { prev };
    },
    onSuccess: (_r, v) => {
      successHaptic();
      toast(t(`proSvc.statusSaved.${v.status}`), "ok");
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("adm.actionFailed"), "err");
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export const useRemoveService = () => useAdminMutation({ mutationFn: removeService, invalidate: [serviceKeys.all], success: "proSvc.toast.removed" });
