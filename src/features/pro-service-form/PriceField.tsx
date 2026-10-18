import { StyleSheet, View } from "react-native";
import { bandRecommended, type PriceBand } from "@/entities/pro-service";
import { Chip, Icon, Input, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

type Props = { value: string; onChange: (digits: string) => void; band: PriceBand | null; error?: string; catalogPrice: number; disabled?: boolean };

// Price in whole so'm with a "so'm" suffix. Disabled before a service is picked and — as on the web — when the catalogue has
// no price; otherwise chips jump to the recommended / minimum price or back to the catalogue price (empty).
export function PriceField({ value, onChange, band, error, catalogPrice, disabled }: Props) {
  const { t } = useT();
  const n = Number(value || "0");
  const locked = !disabled && catalogPrice === 0;
  const off = disabled || locked;
  const rec = band ? bandRecommended(band) : 0;
  const hint = error ? undefined : disabled || locked ? undefined : catalogPrice ? t("proSvc.form.priceHintBase", { price: fmtMoney(catalogPrice) }) : t("proSvc.form.priceHint");
  return (
    <View style={s.col}>
      <Input accessibilityLabel={t("proSvc.form.price")} value={value ? fmtMoney(n) : ""} editable={!off} onChangeText={(v) => onChange(v.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12))} keyboardType="number-pad" placeholder={locked ? t("proSvc.form.noPricePh") : t("proSvc.form.pricePh")} error={error} hint={hint} left={<Icon name="tag" size={18} tone="gray" />} right={<Text variant="small" weight="semibold" tone="gray">{t("proSvc.form.som")}</Text>} />
      {off ? null : (
        <View style={s.chips}>
          {band ? <Chip label={t("proSvc.form.useRecommended", { price: fmtMoney(rec) })} active={n === rec} onPress={() => onChange(String(rec))} /> : null}
          {band ? <Chip label={t("proSvc.form.useMin", { price: fmtMoney(band.min) })} active={n === band.min} onPress={() => onChange(String(band.min))} /> : null}
          {value ? <Chip label={t("proSvc.form.useCatalog")} onPress={() => onChange("")} /> : null}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 8 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
