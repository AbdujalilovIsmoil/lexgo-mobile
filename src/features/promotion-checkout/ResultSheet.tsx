import { View } from "react-native";
import type { CheckoutResult } from "@/entities/promotion";
import { useColors } from "@/shared/theme";
import { BottomSheet, Button, Icon, Text } from "@/shared/ui";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

type Props = { result: CheckoutResult | null; onClose: () => void };

// After the checkout: the request is PENDING until an admin approves it in Telegram — never "paid" here.
export function ResultSheet({ result, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const sent = !!result?.telegramSent;
  return (
    <BottomSheet visible={!!result} onClose={onClose} snaps={[0.55]}>
      <View style={{ padding: 22, gap: 12, alignItems: "center" }}>
        <Icon name={sent ? "clock" : "alert-triangle"} size={40} color={sent ? c.accent : c.warn} />
        <Text variant="h3" center>{t(sent ? "sl11.result.pending" : "sl11.result.notSent")}</Text>
        <Text variant="small" tone="gray" center>{t(sent ? "sl11.result.pendingText" : "sl11.result.notSentText")}</Text>
        {result ? <Text variant="small" weight="bold" center>{[result.workId, result.amount ? som(result.amount) : ""].filter(Boolean).join(" · ")}</Text> : null}
        <Button title={t("sl11.result.ok")} full onPress={onClose} />
      </View>
    </BottomSheet>
  );
}
