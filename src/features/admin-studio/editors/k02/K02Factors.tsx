import { View } from "react-native";
import { Card, Segmented, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../../form/Block";
import { NumberField } from "../../form/NumberField";
import { RefField } from "../../form/RefField";
import { refLabel } from "../../form/refLabels";
import type { Errors } from "../../form/types";
import { errorFor, rec, strList, withKey } from "../../form/values";
import { ADJUSTMENTS, overrideOf, pruneOverrides } from "./k02Logic";

type Props = { payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };

// Price factors of this service. Each selected factor can carry its own value (a fixed sum or a percent) that applies to this service
// only; a factor taken off the list takes its value with it, and a factor without a value uses the shared one.
export function K02Factors({ payload, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const ids = strList(payload.price_factor_ids);
  const overrides = rec(payload.price_factor_overrides);
  const pick = (next: string[]) => onChange(pruneOverrides(withKey(payload, "price_factor_ids", next)));
  const setOverride = (id: string, v: Dict | null) => {
    const { [id]: _drop, ...rest } = overrides;
    onChange(withKey(payload, "price_factor_overrides", v ? { ...rest, [id]: v } : rest));
  };
  return (
    <Block title={t("admStudioD.k02.factors")} hint={t("admStudioD.k02.factorsHint")} count={ids.length}>
      <RefField label={t("admStudioD.k02.factor")} source="/studio/reference/price-factors" multi value={ids} onChange={pick} readOnly={readOnly} error={errorFor(errors, "price_factor_ids")} />
      {ids.map((id) => {
        const has = id in overrides;
        const o = overrideOf(overrides[id]);
        const err = errors[`price_factor_overrides.${id}.value`] ?? errors[`price_factor_overrides[${id}].value`] ?? "";
        return (
          <Card key={id} style={{ gap: 10 }}>
            <Text variant="small" weight="bold" numberOfLines={2}>{refLabel(id) ?? `${id.slice(0, 8)}…`}</Text>
            {has ? (
              <>
                <Segmented options={ADJUSTMENTS.map((v) => ({ value: v, label: t(`admStudioD.k02.adjusts.${v}`) }))} value={o.adjustment_type === "percent" ? "percent" : "fixed"} onChange={(v) => !readOnly && setOverride(id, { adjustment_type: v, value: o.value })} />
                <NumberField label={t(o.adjustment_type === "percent" ? "admStudioD.k02.adjusts.percent" : "admStudioD.k02.amount")} value={o.value} onChange={(v) => setOverride(id, { adjustment_type: o.adjustment_type, value: v ?? "" })} readOnly={readOnly} error={err} />
              </>
            ) : <Text variant="caption" tone="gray">{t("admStudioD.k02.sharedValue")}</Text>}
            {readOnly ? null : (
              <View style={{ alignSelf: "flex-start" }}>
                <Text variant="small" weight="bold" tone="accent" onPress={() => setOverride(id, has ? null : { adjustment_type: "fixed", value: "" })}>{t(has ? "admStudioD.k02.overrideOff" : "admStudioD.k02.overrideOn")}</Text>
              </View>
            )}
          </Card>
        );
      })}
    </Block>
  );
}
