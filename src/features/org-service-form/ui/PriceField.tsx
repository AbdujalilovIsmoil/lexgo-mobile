import { View } from "react-native";
import { Chip, Input, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { digitsOf, outOfBand, recommended, type PriceBand } from "@/entities/organization";
import { BandBar } from "./BandBar";
import { PriceBreakdown } from "./PriceBreakdown";

type Props = { value: string; onChange: (digits: string) => void; band: PriceBand | null; estimate: number; loading: boolean; catalogPrice: number; error?: string };

// The member's price: typed digits, quick picks (recommended / minimum / catalog) and the allowed range.
export function PriceField({ value, onChange, band, estimate, loading, catalogPrice, error }: Props) {
  const { t } = useT();
  const n = Number(value || 0);
  const off = outOfBand(n, band);
  const som = (x: number) => fmtMoney(x);
  const hint = error ?? (off && band ? t("og6.priceOut", { min: som(band.min), max: som(band.max) }) : loading ? t("og6.bandLoading") : band ? t("og6.bandHint") : estimate ? t("og6.estimate", { price: som(estimate) }) : catalogPrice ? t("og6.hintBase", { price: som(catalogPrice) }) : t("og6.hintNone"));
  return (
    <View style={{ gap: 10 }}>
      <Input label={t("adm.price")} value={value ? som(n) : ""} onChangeText={(x) => onChange(digitsOf(x))} keyboardType="number-pad" placeholder={band ? som(recommended(band)) : t("og6.pricePh")} error={off || error ? hint : undefined} hint={off || error ? undefined : hint} right={<Text variant="small" tone="gray">{t("adm.currency")}</Text>} />
      {band ? <BandBar band={band} price={n} off={off} /> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {band ? <Chip label={t("og6.useRec", { price: som(recommended(band)) })} active={n === recommended(band)} onPress={() => onChange(String(recommended(band)))} /> : null}
        {band ? <Chip label={t("og6.useMin", { price: som(band.min) })} active={n === band.min} onPress={() => onChange(String(band.min))} /> : null}
        {value ? <Chip label={t("og6.useCatalog")} onPress={() => onChange("")} /> : null}
      </View>
      {band ? <PriceBreakdown band={band} /> : null}
    </View>
  );
}
