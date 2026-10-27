import { StyleSheet, View } from "react-native";
import { ErrorView, Skeleton } from "@/shared/ui";
import type { ServiceRule } from "@/entities/service-rules";
import { configUnsupported } from "./configApi";
import { GrowthCard } from "./GrowthCard";
import { NegotiationRow } from "./NegotiationRow";
import { PriceCard } from "./PriceCard";
import { useServiceConfiguration } from "./queries";
import { RulesCard } from "./RulesCard";

type Props = {
  serviceId: string;
  status: string; // "active" | "paused" | "inactive"
  onRules: (missing: string[], rules: ServiceRule[]) => void; // open the rules sheet for this service
};

// The marketplace configuration of one service (GET …/configuration: TZ.md §5.3 and "Pricing Growth" §2) as blocks of the
// service sheet: its rules, the price limits with LexGo's explanation, the negotiation switch, and how far the ceiling can still
// grow and what that takes. Every value is the server's; a change PATCHes and the answer replaces the cached configuration.
export function ConfigPanel({ serviceId, status, onRules }: Props) {
  const q = useServiceConfiguration(serviceId);
  if (q.isPending) {
    return (
      <View style={s.col}>
        <Skeleton height={120} round={20} />
        <Skeleton height={160} round={20} />
      </View>
    );
  }
  if (q.isError) return configUnsupported(q.error) ? null : <ErrorView error={q.error} onRetry={() => void q.refetch()} compact />;
  const c = q.data;
  return (
    <View style={s.col}>
      <RulesCard serviceId={serviceId} config={c} onRules={onRules} />
      <PriceCard config={c} />
      <NegotiationRow serviceId={serviceId} config={c} status={status} onRules={(missing) => onRules(missing.length ? missing : c.missingRuleIds, c.requiredRules)} />
      <GrowthCard config={c} />
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 14 } });
