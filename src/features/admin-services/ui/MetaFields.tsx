import type { UseFormReturn } from "react-hook-form";
import { Text } from "@/shared/ui";
import { SectionCard, SwitchField } from "@/shared/ui/admin";
import { FormInput } from "@/shared/form";
import { useT } from "@/shared/i18n";
import type { FormVals } from "../model/serviceForm";
import { digitsOnly } from "../model/serviceSchema";

type Props = { f: UseFormReturn<FormVals, unknown, FormVals>; enabled: boolean };
type TextKey = "title_uz_latn" | "title_uz_cyrl" | "title_ru" | "executor_type" | "pricing_tier" | "sla_code" | "refund_code" | "ai_category";
const TEXT: [TextKey, string][] = [["title_uz_latn", "titleUzLatn"], ["title_uz_cyrl", "titleUzCyrl"], ["title_ru", "titleRu"], ["executor_type", "executorType"], ["pricing_tier", "pricingTier"], ["sla_code", "slaCode"], ["refund_code", "refundCode"], ["ai_category", "aiCategory"]];

// Catalogue metadata: titles in three scripts, executor, tier, codes, price. Locked for services without a metadata row.
export function MetaFields({ f, enabled }: Props) {
  const { t } = useT();
  return (
    <SectionCard title={t("admSvcB.meta")}>
      {enabled ? null : <Text variant="small" tone="warn">{t("admSvcB.noMeta")}</Text>}
      {TEXT.map(([k, label]) => <FormInput key={k} control={f.control} name={k} label={t(`admSvcB.${label}`)} editable={enabled} autoCapitalize="none" />)}
      <FormInput control={f.control} name="standard_price" label={t("admSvcB.standardPrice")} format={digitsOnly} keyboardType="number-pad" editable={enabled} />
      {enabled ? <SwitchField label={t("admSvcB.advokatRequired")} value={f.watch("advokat_required")} onChange={(x) => f.setValue("advokat_required", x)} /> : null}
    </SectionCard>
  );
}
