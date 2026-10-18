import { StyleSheet, View } from "react-native";
import type { PriceBand } from "@/entities/pro-service";
import { bandRecommended } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { Skeleton, Text } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import { ModifierList } from "./ModifierList";

type Props = { band: PriceBand | null; loading: boolean; price: number };

// The server's price corridor for this service and seller (region · experience · rating factors), live (TZ 19).
export function BandCard({ band, loading, price }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  if (loading) return <View style={{ gap: 6 }}><Skeleton height={96} round={16} /><Text variant="caption" tone="gray">{t("proSvc.form.bandLoading")}</Text></View>;
  if (!band) return <Text variant="caption" tone="gray2">{t("proSvc.form.bandUnknown")}</Text>;
  const lo = band.min * 0.86;
  const hi = band.max * 1.1;
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo || 1)) * 100))}%` as `${number}%`;
  const off = price > 0 && band.max > 0 && price > band.max;
  return (
    <View style={[s.box, { borderColor: off ? c.err : c.line, backgroundColor: c.surface2 }]}>
      <Text variant="small" weight="bold">{t("proSvc.corridor")}</Text>
      <View style={[s.track, { backgroundColor: c.line }]}>
        <View style={[s.range, { left: pos(band.min), right: `${100 - parseFloat(pos(band.max))}%`, backgroundColor: `${c.ok}66` }]} />
        {price > 0 ? <View style={[s.dot, { left: pos(price), backgroundColor: off ? c.err : c.accent, borderColor: c.surface }]} /> : null}
      </View>
      <Text variant="caption" tone="gray">{t("proSvc.form.bandHint", { min: fmtMoney(band.min), max: fmtMoney(band.max) })}</Text>
      <Text variant="caption" weight="semibold">{t("proSvc.recommended")}: {som(bandRecommended(band))}</Text>
      {band.base ? <Text variant="caption" tone="gray">{t("proSvc.card.catalogPrice")}: {som(band.base)}</Text> : null}
      <ModifierList modifiers={band.modifiers ?? []} />
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1.5, borderRadius: 16, padding: 14, gap: 8 },
  track: { height: 8, borderRadius: 4, marginVertical: 6 },
  range: { position: "absolute", top: 0, bottom: 0, borderRadius: 4 },
  dot: { position: "absolute", top: -4, width: 16, height: 16, borderRadius: 8, borderWidth: 2, marginLeft: -8 },
});
