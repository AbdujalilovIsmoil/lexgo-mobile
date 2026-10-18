import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { Text, Toggle } from "@/shared/ui";
import type { ServiceConfig } from "./configApi";
import { useServiceConfig } from "./useServiceConfig";
import { PriceExplanation } from "./PriceExplanation";

type Props = {
  serviceId: string;
  status: string; // "active" | "paused" | "inactive"
  negotiationAllowed: boolean | null; // null → the current choice is unknown
  onSaved?: (c: ServiceConfig) => void;
};

// Marketplace settings of one service: the negotiation switch PATCHes on change (reverts on failure) and the
// answer's price explanation shows under it. Factors / Requirements are separate blocks the caller places.
export function ConfigPanel({ serviceId, status, negotiationAllowed, onSaved }: Props) {
  const { t } = useT();
  const m = useServiceConfig();
  const [value, setValue] = useState<boolean | null>(negotiationAllowed);
  const [saved, setSaved] = useState<ServiceConfig | null>(null);
  const [synced, setSynced] = useState(negotiationAllowed);
  if (synced !== negotiationAllowed) { // the parent refetched: follow it
    setSynced(negotiationAllowed);
    setValue(negotiationAllowed);
  }
  const change = (next: boolean) => {
    const prev = value;
    setValue(next);
    m.mutate({ serviceId, patch: { negotiationAllowed: next } }, {
      onSuccess: (c) => { setSaved(c); setValue(c.negotiationAllowed ?? next); onSaved?.(c); },
      onError: () => setValue(prev),
    });
  };
  return (
    <View style={s.box}>
      <View style={s.row}>
        <View style={s.flex}>
          <Text variant="h4">{t("svcRules.cfgNegotiation")}</Text>
          <Text variant="caption" tone="gray">{t("svcRules.cfgNegotiationHint")}</Text>
          {value === null ? <Text variant="caption" tone="warn">{t("svcRules.cfgNegotiationUnknown")}</Text> : null}
          {status !== "active" ? <Text variant="caption" tone="gray">{t("svcRules.cfgNegotiationActiveOnly")}</Text> : null}
        </View>
        <Toggle value={!!value} onChange={change} disabled={m.isPending} label={t("svcRules.cfgNegotiation")} />
      </View>
      {saved ? <PriceExplanation text={saved.priceExplanation} lines={saved.priceExplanationLines} /> : null}
    </View>
  );
}

// Chip wording for a list card when negotiation is on.
export const negotiationChipKey = "svcRules.cfgNegotiationChip";

const s = StyleSheet.create({ box: { gap: 12 }, row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 }, flex: { flex: 1, gap: 2 } });
