import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { FeatureTerm } from "../model/features";
import { useFeatureLabel, useTermValue } from "../model/useFeatureLabel";

// A tariff's feature terms — the snapshot a subscription was bought with, or the new version before renewal. With `before` (the terms in
// force now) a changed row also says what it is now, and a feature the new version drops is listed as locked.
export function TermList({ terms, before }: { terms: FeatureTerm[]; before?: FeatureTerm[] }) {
  const c = useColors();
  const { t } = useT();
  const label = useFeatureLabel();
  const value = useTermValue();
  const dropped: FeatureTerm[] = (before ?? []).filter((b) => !terms.some((x) => x.key === b.key)).map((b) => ({ ...b, mode: "unavailable", limit: null }));
  return (
    <View style={s.col}>
      {[...terms, ...dropped].map((x) => {
        const old = before?.find((b) => b.key === x.key);
        const changed = !!before && (!old || old.mode !== x.mode || old.limit !== x.limit);
        const off = x.mode === "unavailable";
        return (
          <View key={x.key} style={s.row}>
            <Icon name={off ? "x-circle" : "check-circle"} size={18} color={off ? c.gray2 : c.ok} />
            <View style={s.text}>
              <Text variant="small" weight="semibold" tone={off ? "gray2" : "ink"}>{label(x.key)}</Text>
              {changed && old ? <Text variant="caption" tone="gray">{t("subq.contract.was", { v: value(old) })}</Text> : null}
            </View>
            <Text variant="caption" weight="bold" tone={changed ? "warn" : off ? "gray2" : "accent"}>{value(x)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  text: { flex: 1, gap: 1 },
});
