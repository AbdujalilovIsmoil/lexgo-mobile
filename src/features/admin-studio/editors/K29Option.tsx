import { View } from "react-native";
import { Card, Segmented, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { NumberField } from "../form/NumberField";
import { RowTools } from "../form/RowTools";
import { TextField } from "../form/TextField";
import type { Errors } from "../form/types";
import { str } from "../form/values";
import { ADJUSTMENTS, optionId } from "./k29Logic";

type Props = { o: Dict; i: number; count: number; errors: Errors; readOnly: boolean; onPatch: (p: Dict) => void; onMove: (d: -1 | 1) => void; onRemove: () => void };

// One price option: id, label, fixed|percent switch, value (>= 0 — options only increase the price), order.
export function K29Option({ o, i, count, errors, readOnly, onPatch, onMove, onRemove }: Props) {
  const { t } = useT();
  const pct = str(o.adjustment_type) === "percent";
  const setLabel = (label: string) => onPatch(!str(o.id) || str(o.id) === optionId(str(o.label)) ? { label, id: optionId(label) } : { label });
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="small" weight="bold" tone="gray">{t("ntd.studioV2.option", { n: i + 1 })}</Text>
        {readOnly ? null : <RowTools index={i} count={count} onMove={onMove} onRemove={onRemove} />}
      </View>
      <TextField label={t("ntd.studioV2.optLabel")} value={str(o.label)} onChange={setLabel} readOnly={readOnly} error={errors.label} required />
      <TextField label={t("ntd.studioV2.optId")} value={str(o.id)} onChange={(id) => onPatch({ id })} readOnly={readOnly} error={errors.id} mono required />
      <TextField label={t("ntd.studioV2.optDesc")} value={str(o.description)} onChange={(description) => onPatch({ description })} readOnly={readOnly} multiline />
      <View pointerEvents={readOnly ? "none" : "auto"} style={{ opacity: readOnly ? 0.6 : 1 }}>
        <Segmented options={ADJUSTMENTS.map((v) => ({ value: v, label: t(`ntd.studioV2.adj.${v}`) }))} value={pct ? "percent" : "fixed"} onChange={(adjustment_type) => onPatch({ adjustment_type })} />
      </View>
      <NumberField label={t(pct ? "ntd.studioV2.valuePct" : "ntd.studioV2.valueUzs")} value={o.value} onChange={(value) => onPatch({ value })} readOnly={readOnly} error={errors.value} hint={t("ntd.studioV2.valueHint")} required />
    </Card>
  );
}
