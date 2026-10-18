import { View } from "react-native";
import type { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/shared/form";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { VAT_PERCENT } from "@/entities/admin-b2b";

type Props = { f: UseFormReturn<{ amount: string; description: string }, unknown, { amount: string; description: string }>; amount: number };
const spaced = (x: string) => { const n = parseInt(x.replace(/\D/g, "") || "0", 10) || 0; return n ? fmtMoney(n) : ""; };

// Invoice inputs: the amount without VAT, a description, and the live VAT / total breakdown.
export function InvoiceFields({ f, amount }: Props) {
  const { t } = useT();
  const vat = Math.round((amount * VAT_PERCENT) / 100);
  const som = (n: number) => `${fmtMoney(n)} ${t("adm.currency")}`;
  return (
    <View style={{ gap: 14 }}>
      <FormInput control={f.control} name="amount" label={t("admB2b.amountNoVat")} format={spaced} keyboardType="number-pad" placeholder="1 000 000" />
      <FormInput control={f.control} name="description" label={t("adm.description")} placeholder={t("admB2b.descriptionPh")} />
      <FactRows rows={[{ label: t("admB2b.amountNoVat"), value: som(amount) }, { label: t("admB2b.vat", { pct: VAT_PERCENT }), value: som(vat) }, { label: t("admB2b.total"), value: som(amount + vat) }]} />
    </View>
  );
}
