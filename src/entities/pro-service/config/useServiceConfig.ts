import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { patchServiceConfig, type ConfigPatch } from "./configApi";

// PATCH the marketplace configuration; haptic on success, the server's message (or the web's) on failure.
export function useServiceConfig() {
  const { t } = useT();
  return useMutation({
    mutationFn: ({ serviceId, patch }: { serviceId: string; patch: ConfigPatch }) => patchServiceConfig(serviceId, patch),
    onSuccess: () => successHaptic(),
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("svcRules.cfgConfigFailed"), "err");
    },
  });
}
