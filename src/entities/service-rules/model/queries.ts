import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { useT } from "@/shared/i18n";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { toast } from "@/shared/ui";
import { useIsAuthed } from "@/entities/session";
import { acceptRule, listRules } from "../api/rulesApi";
import type { ServiceRule } from "./types";

export const ruleKeys = { all: ["service-rules"] as const };

// The seller's service configuration (entities/pro-service/config) carries the rules state too, so a rule accepted here — or on
// another device (marketplace.rule_accepted) — invalidates both (TZ.md §17).
export const sellerConfigKey = ["seller-service-configuration"] as const;

export const refreshRules = (qc: QueryClient) => {
  void qc.invalidateQueries({ queryKey: ruleKeys.all });
  void qc.invalidateQueries({ queryKey: sellerConfigKey });
};

// One service's rules (`?service_id=`), or every rule of the seller when no id is given.
export const useServiceRules = (serviceId?: string, enabled = true) => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: [...ruleKeys.all, serviceId ?? ""], queryFn: () => listRules(serviceId), enabled: authed && enabled, staleTime: 30_000 });
};

// Accept one rule; the rules (every service scope) and the configurations are refetched, a toast + haptic confirm it.
export function useAcceptRule() {
  const qc = useQueryClient();
  const { t } = useT();
  return useMutation({
    mutationFn: (rule: ServiceRule) => acceptRule(rule.id),
    onSuccess: (_r, rule) => {
      successHaptic();
      toast(t("svcRules.rulesAcceptedLive", { title: rule.title || rule.version }), "ok");
      refreshRules(qc);
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("svcRules.rulesAcceptError"), "err");
    },
  });
}
