import { View } from "react-native";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { PackTier } from "../model/types";

// The three tiers, read-only: price and content come from Studio. A tier the backend marks not eligible (PREMIUM -> extended
// LexGo verification) shows the backend's own requirement text.
export function TierRows({ tiers }: { tiers: PackTier[] }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ gap: 8 }}>
      {tiers.map((x) => (
        <View key={x.tier} style={{ gap: 2, padding: 12, borderRadius: 14, backgroundColor: c.surface2 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <Text variant="small" weight="bold">{t(`mk8.tiers.${x.tier}`).startsWith("mk8.") ? x.title || x.tier : t(`mk8.tiers.${x.tier}`)}</Text>
            <Text variant="small" weight="bold" tone="accent">{fmtMoney(x.price)} {t("common.currency")}</Text>
          </View>
          {x.duration ? <Text variant="caption" tone="gray">{x.duration}</Text> : null}
          {x.included.length ? <Text variant="caption" tone="gray">{x.included.join(" · ")}</Text> : null}
          {!x.eligible || x.reasons.length ? x.reasons.map((r) => <Text key={r} variant="caption" tone={x.eligible ? "gray" : "warn"}>{r}</Text>) : null}
        </View>
      ))}
    </View>
  );
}
