import { View } from "react-native";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";
import type { SellerPackage } from "../model/types";
import { TierRows } from "./TierRows";

type Props = { pkg: SellerPackage; busy: boolean; onEnable: () => void; onStatus: (s: "active" | "disabled") => void };

// One Studio package: read-only price and content (price_editable=false), its eligibility texts from the backend and the
// enable / switch controls - shown only when the backend says this seller may sell it (TZ 5.2, 16).
export function SellerPackageCard({ pkg: p, busy, onEnable, onStatus }: Props) {
  const { t } = useT();
  const on = p.enabled && p.status !== "disabled";
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h4">{p.title || p.code}</Text>
          {p.category ? <Text variant="caption" tone="gray">{p.category}</Text> : null}
        </View>
        <Pill label={t(p.enabled ? (on ? "ntd.sellerV2.pkg.on" : "ntd.sellerV2.pkg.off") : "ntd.sellerV2.pkg.notEnabled")} tone={on ? "ok" : p.enabled ? "warn" : "gray"} small />
      </View>
      {p.description ? <Text variant="small" tone="gray">{p.description}</Text> : null}
      <TierRows tiers={p.tiers} />
      {p.items.length ? <Text variant="caption" tone="gray">{p.items.join(" · ")}</Text> : null}
      {!p.priceEditable ? <Text variant="caption" tone="gray2">{t("ntd.sellerV2.pkg.fixed")}</Text> : null}
      {!p.eligible ? <Notice tone="warn" text={p.reasons.join("\n") || t("ntd.sellerV2.pkg.notEligible")} /> : null}
      {p.eligible && !p.enabled ? <Button title={t("ntd.sellerV2.pkg.enable")} icon="check" loading={busy} onPress={onEnable} /> : null}
      {p.eligible && p.enabled ? <Button title={t(on ? "ntd.sellerV2.pkg.disable" : "ntd.sellerV2.pkg.activate")} icon={on ? "pause" : "play"} variant="line" loading={busy} onPress={() => onStatus(on ? "disabled" : "active")} /> : null}
    </Card>
  );
}
