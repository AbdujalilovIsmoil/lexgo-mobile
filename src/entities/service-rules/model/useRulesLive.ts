import { useQueryClient } from "@tanstack/react-query";
import { useResync, useUserEvents } from "@/shared/realtime";
import { acceptedRuleOf } from "../lib/ruleEvent";
import { refreshRules } from "./queries";

// marketplace.rule_accepted on the user socket (this seller accepted a rule, maybe on the web): the rules and the service
// configurations are read again (TZ.md §10, §17). A reconnect refetches them too, in case an event was missed.
export function useRulesLive(): void {
  const qc = useQueryClient();
  useUserEvents(["marketplace.rule_accepted", "marketplace_rule_accepted", "notification.created"], (e) => {
    if (acceptedRuleOf(e)) refreshRules(qc);
  });
  useResync(() => refreshRules(qc));
}
