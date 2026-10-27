import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { rulesBlockOf, type RulesTarget } from "@/entities/service-rules";
import { listServices, removeService } from "../api/serviceApi";
import { quoteBand } from "../api/priceApi";
import { configKeys } from "../config/queries";
import { saveService, turnOff, turnOn } from "../config/switch";
import type { ServiceConfig } from "../config/types";
import type { ProServices, ServiceInput, ServiceStatus } from "./types";

export const serviceKeys = { all: ["pro-service"] as const, list: ["pro-service", "me", "list"] as const };

export const useProServices = () => useQuery({ queryKey: serviceKeys.list, queryFn: listServices });

// Corridor for a service that is not in the list yet (10 min cache, like the web).
export const useQuoteBand = (serviceId: string, sellerId: string, region: string) =>
  useQuery({ queryKey: [...serviceKeys.all, "band", serviceId, sellerId, region], enabled: !!serviceId, staleTime: 10 * 60 * 1000, retry: false, queryFn: () => quoteBand(serviceId, sellerId, region) });

// Add / edit (config/switch saveService) report their failure inside the form (serviceErrorOf), so no toast here. The list and
// the service's configuration are read again either way; a 409 means someone else changed it.
export function useSaveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, create, wasActive }: { input: ServiceInput; create: boolean; wasActive: boolean }) => saveService(input, create, wasActive),
    onSettled: (_r, _e, v) => {
      void qc.invalidateQueries({ queryKey: serviceKeys.all });
      void qc.invalidateQueries({ queryKey: configKeys.one(v.input.serviceId) });
    },
  });
}

// The on/off switch of a card and of the sheet. On = the service's configuration is checked and sent whole (config/switch turnOn);
// when its rules are missing — before sending or in a 409 — the service stays off and `onRules` opens them. Pause / off = the
// status endpoint, then the configuration is switched off too. The switch moves at once (the cached list is patched) and goes back
// if it did not happen; the list is refetched afterwards because "visible in the marketplace" is the server's call. The toast
// names the new state.
export function useServiceStatus(onRules: (t: RulesTarget) => void) {
  const { t } = useT();
  const qc = useQueryClient();
  const key = serviceKeys.list;
  const back = (prev?: ProServices) => prev && qc.setQueryData(key, prev);
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceStatus }) => (status === "active" ? turnOn(qc, id) : turnOff(qc, id, status)),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ProServices>(key);
      qc.setQueryData<ProServices>(key, (d) => (d ? { ...d, items: d.items.map((x) => (x.id === id ? { ...x, status, visible: status === "active" && x.visible } : x)) } : d));
      return { prev };
    },
    onSuccess: (r, v, ctx) => {
      if (r.blocked) {
        back(ctx.prev);
        errorHaptic();
        return onRules({ serviceId: v.id, focus: r.blocked.missing, extra: r.blocked.rules });
      }
      successHaptic();
      toast(t(`proSvc.statusSaved.${v.status}`), "ok");
      if (r.warn) toast(t("svcRules.cfgConfigFailed"), "err");
    },
    onError: (e, v, ctx) => {
      back(ctx?.prev);
      errorHaptic();
      const known = qc.getQueryData<ServiceConfig>(configKeys.one(v.id));
      void qc.invalidateQueries({ queryKey: configKeys.one(v.id) });
      const missing = rulesBlockOf(e);
      if (missing) return onRules({ serviceId: v.id, focus: missing, extra: known?.requiredRules });
      toast(e instanceof ApiError && e.detail && e.status !== 409 ? e.detail : t(e instanceof ApiError && e.status === 409 ? "scfg.errConflict" : "adm.actionFailed"), "err");
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export const useRemoveService = () => useAdminMutation({ mutationFn: removeService, invalidate: [serviceKeys.all], success: "proSvc.toast.removed" });
