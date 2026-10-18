import { StyleSheet, View } from "react-native";
import { bandRecommended, type PriceBand } from "@/entities/pro-service";
import { Chip, Input } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { value: string; onChange: (digits: string) => void; band: PriceBand | null; error?: string; catalogPrice: number };

// Price in whole so'm. Chips jump to the recommended / minimum price or back to the catalogue price (empty).
export function PriceField({ value, onChange, band, error, catalogPrice }: Props) {
  const { t } = useT();
  const som = useSom();
  const n = Number(value || "0");
  return (
    <View style={s.col}>
      <Input label={t("sl7.price")} value={value ? fmtMoney(n) : ""} onChangeText={(v) => onChange(v.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12))} keyboardType="number-pad" placeholder={band ? String(bandRecommended(band)) : catalogPrice ? String(catalogPrice) : "0"} error={error} hint={!error ? (n ? som(n) : catalogPrice ? t("sl7.useCatalogHint", { sum: som(catalogPrice) }) : t("sl7.noCatalogPrice")) : undefined} />
      <View style={s.chips}>
        {band ? <Chip label={t("sl7.useRecommended", { sum: som(bandRecommended(band)) })} active={n === bandRecommended(band)} onPress={() => onChange(String(bandRecommended(band)))} /> : null}
        {band ? <Chip label={t("sl7.useMin", { sum: som(band.min) })} active={n === band.min} onPress={() => onChange(String(band.min))} /> : null}
        {value ? <Chip label={t("sl7.useCatalog")} onPress={() => onChange("")} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 8 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
