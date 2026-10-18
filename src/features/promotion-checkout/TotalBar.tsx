import { StyleSheet, View } from "react-native";
import type { PromoPackage } from "@/entities/promotion";
import { Button, Text } from "@/shared/ui";
import { useSom } from "@/shared/lib/sel";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { pkg: PromoPackage | null; note: string; isError: boolean; canBack: boolean; last: boolean; enabled: boolean; busy: boolean; onBack: () => void; onNext: () => void };

// Sticky bottom bar of the wizard: why it can't go on (if so), the running total «package · days ····· amount», and the short
// Orqaga / Davom etish (Yuborish on the last step) buttons.
export function TotalBar({ pkg, note, isError, canBack, last, enabled, busy, onBack, onNext }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  return (
    <View style={s.box}>
      {note ? <Text variant="small" accessibilityRole="alert" style={{ color: isError ? c.err : c.gray }}>{note}</Text> : null}
      {pkg ? (
        <View accessible accessibilityLabel={`${t("promoSeller.ck.total")}: ${pkg.title}, ${t("promoSeller.ck.days", { d: pkg.days })}, ${som(pkg.price)}`} style={s.total}>
          <Text variant="small" tone="gray" numberOfLines={1} style={s.fill}>{`${pkg.title} · ${t("promoSeller.ck.days", { d: pkg.days })}`}</Text>
          <Text variant="h4">{som(pkg.price)}</Text>
        </View>
      ) : null}
      <View style={s.btns}>
        {canBack ? <Button title={t("promoSeller.ck.back")} variant="line" onPress={onBack} disabled={busy} /> : null}
        <Button title={t(last ? "promoSeller.ck.send" : "promoSeller.ck.next")} icon={last ? "send" : undefined} loading={busy} disabled={!enabled} onPress={onNext} style={s.fill} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 8 },
  total: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  btns: { flexDirection: "row", gap: 10 },
  fill: { flex: 1 },
});
