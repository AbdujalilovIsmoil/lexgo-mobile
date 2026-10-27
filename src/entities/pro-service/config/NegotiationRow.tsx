import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useSom } from "@/shared/lib/sel";
import { Text, Toggle } from "@/shared/ui";
import { ConfigCard } from "./ConfigCard";
import { useConfigPatch } from "./queries";
import type { ServiceConfig } from "./types";

type Props = { serviceId: string; config: ServiceConfig; status: string; onRules: (missing: string[]) => void };

// Price negotiation (negotiation_allowed): the switch shows the server's value and PATCHes on change. While the request runs it
// shows the new value; a refusal leaves the cache — and so the switch — as it was. Hidden when the service offers no negotiation.
export function NegotiationRow({ serviceId, config: c, status, onRules }: Props) {
  const { t } = useT();
  const som = useSom();
  const m = useConfigPatch((_id, missing) => onRules(missing));
  if (c.negotiationAvailable === false) return null;
  const asked = m.isPending ? m.variables?.patch.negotiationAllowed : undefined;
  const value = asked ?? c.negotiationAllowed;
  return (
    <ConfigCard title={t("svcRules.cfgNegotiation")} right={<Toggle value={!!value} onChange={(next) => m.mutate({ serviceId, patch: { negotiationAllowed: next } })} disabled={m.isPending} label={t("svcRules.cfgNegotiation")} />}>
      <View style={s.col}>
        <Text variant="caption" tone="gray">{t("svcRules.cfgNegotiationHint")}</Text>
        {value === null ? <Text variant="caption" tone="warn">{t("svcRules.cfgNegotiationUnknown")}</Text> : null}
        {c.negotiationMinimumPrice > 0 ? <Text variant="caption" tone="gray">{t("scfg.negotiationMin", { price: som(c.negotiationMinimumPrice) })}</Text> : null}
        {status !== "active" ? <Text variant="caption" tone="gray">{t("svcRules.cfgNegotiationActiveOnly")}</Text> : null}
      </View>
    </ConfigCard>
  );
}

const s = StyleSheet.create({ col: { gap: 2 } });
