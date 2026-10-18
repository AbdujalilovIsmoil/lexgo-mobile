import { View } from "react-native";
import type { CheckoutResult } from "@/entities/promotion";
import { useColors } from "@/shared/theme";
import { BottomSheet, Button, Icon, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { result: CheckoutResult | null; rows: { label: string; value: string }[]; onClose: () => void; onRetry: () => void };

// After the checkout: live at once (no payment needed), waiting for the admin's Telegram approval, or not sent to Telegram
// (then it can be sent again). Never shown as "paid".
export function ResultSheet({ result, rows, onClose, onRetry }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const live = !!result?.activated;
  const sent = !!result?.telegramSent;
  const tone = live ? c.ok : sent ? c.accent : c.warn;
  const key = live ? "active" : sent ? "done" : "fail";
  const facts = [
    ...rows,
    { label: t("promoSeller.ck.amount"), value: som(result?.amount ?? 0) },
    ...(result?.requestId ? [{ label: t("promoSeller.ck.request"), value: result.requestId.slice(0, 8).toUpperCase() }] : []),
  ];
  return (
    <BottomSheet visible={!!result} onClose={onClose} snaps={[0.7]}>
      <View style={{ padding: 22, gap: 12, alignItems: "center" }}>
        <Icon name={live ? "check-circle" : sent ? "clock" : "alert-triangle"} size={40} color={tone} />
        <Text variant="h3" center>{t(`promoSeller.ck.${key}Title`)}</Text>
        <Text variant="small" tone="gray" center>{t(`promoSeller.ck.${key}Text`)}</Text>
        <View style={{ alignSelf: "stretch" }}><FactRows rows={facts} /></View>
        {sent ? <Text variant="small" weight="semibold" center style={{ color: c.ok }}>{t("promoSeller.ck.telegramOk")}</Text> : null}
        {!live && !sent ? <Text variant="small" weight="semibold" center style={{ color: c.warn }}>{t("promoSeller.ck.telegramFail")}</Text> : null}
        <Button title={t("promoSeller.ck.close")} full variant={!live && !sent ? "line" : "primary"} onPress={onClose} />
        {!live && !sent ? <Button title={t("promoSeller.ck.retry")} icon="refresh-cw" full onPress={onRetry} /> : null}
      </View>
    </BottomSheet>
  );
}
