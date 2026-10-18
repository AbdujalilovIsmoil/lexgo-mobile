import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useIsAuthed } from "@/entities/session";
import { acceptRule, listRules } from "../api/rulesApi";
import type { ServiceRule } from "./types";

export const ruleKeys = { all: ["service-rules"] as const };

export const useServiceRules = (serviceId?: string) => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: [...ruleKeys.all, serviceId ?? ""], queryFn: () => listRules(serviceId), enabled: authed, staleTime: 30_000 });
};

// Accept one rule; the list (every service scope) is refetched, a toast + haptic confirm it.
export function useAcceptRule() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (rule: ServiceRule) => acceptRule(rule.id),
    onSuccess: (_r, rule) => {
      successHaptic();
      toast(t("svcRules.rulesAcceptedLive", { title: rule.title || rule.version }), "ok");
      void qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("svcRules.rulesAcceptError"), "err");
    },
  });
}
