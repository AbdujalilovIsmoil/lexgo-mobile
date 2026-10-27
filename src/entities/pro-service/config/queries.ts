import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { rulesBlockOf, sellerConfigKey } from "@/entities/service-rules";
import { configUnsupported, getServiceConfig, patchServiceConfig } from "./configApi";
import type { ConfigPatch } from "./types";

export const configKeys = { all: sellerConfigKey, one: (serviceId: string) => [...sellerConfigKey, serviceId] as const };

export const configQuery = (serviceId: string) => ({ queryKey: configKeys.one(serviceId), queryFn: () => getServiceConfig(serviceId), staleTime: 30_000 });

// The one reader of GET …/configuration: the sheet, the form and the switch share it (TZ.md §17 key).
export const useServiceConfiguration = (serviceId: string) =>
  useQuery({ ...configQuery(serviceId), enabled: !!serviceId, retry: (n: number, e: unknown) => !configUnsupported(e) && !(e instanceof ApiError && e.status > 0 && e.status < 500) && n < 2 });

type Vars = { serviceId: string; patch: ConfigPatch };

// A change made in the configuration panel (negotiation, rule picks): the answer replaces the cached configuration. A refusal
// over rules goes to `onRules` with the ids it names; any other one is said in a toast, and a 409 reads the configuration again.
export function useConfigPatch(onRules?: (serviceId: string, missing: string[]) => void) {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: ({ serviceId, patch }: Vars) => patchServiceConfig(serviceId, patch),
    onSuccess: (c, v) => {
      successHaptic();
      qc.setQueryData(configKeys.one(v.serviceId), c);
    },
    onError: (e, v) => {
      errorHaptic();
      const missing = rulesBlockOf(e);
      if (missing && onRules) onRules(v.serviceId, missing);
      else toast(missing ? t("svcRules.rulesLockReason") : e instanceof ApiError && e.detail && e.status !== 409 ? e.detail : t("svcRules.cfgConfigFailed"), "err");
      if (e instanceof ApiError && e.status === 409) void qc.invalidateQueries({ queryKey: configKeys.one(v.serviceId) });
    },
  });
}
