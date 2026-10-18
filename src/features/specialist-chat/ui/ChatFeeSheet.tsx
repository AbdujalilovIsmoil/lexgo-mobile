import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPayment, fmtUzs, isProviderDown, PROVIDER_LADDER, payKeys, usePaymentError } from "@/entities/payment";
import { PRIVATE_CHAT_FEE } from "@/entities/secure-chat";
import { PaymentPendingCard, useOpenPayment } from "@/features/payments";
import { BottomSheet, Button, Icon, SheetScroll, Text, toast } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; lawyerId: string; opening: boolean; onClose: () => void; onPaid: () => void };
type Invoice = { id: string; url: string };

// The one-time private-chat fee: creates the payment (first provider that is connected), opens its page and then
// follows it; the moment the backend says "paid", `onPaid` opens the chat.
export function ChatFeeSheet({ visible, lawyerId, opening, onClose, onPaid }: Props) {
  const c = useColors();
  const { t } = useT();
  const qc = useQueryClient();
  const fail = usePaymentError();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const openPage = useOpenPayment();
  const pay = useMutation({
    mutationFn: async () => {
      for (const provider of PROVIDER_LADDER) {
        try {
          return await createPayment({ provider, amount: PRIVATE_CHAT_FEE, targetType: "private_chat", targetId: lawyerId });
        } catch (e) {
          if (!isProviderDown(e)) throw e;
        }
      }
      return null;
    },
    onSuccess: (p) => {
      if (!p) return toast(t("spf.unavailable"), "err");
      void qc.invalidateQueries({ queryKey: payKeys.list });
      setInvoice({ id: p.id, url: p.paymentUrl });
      if (p.paymentUrl) void openPage(p.paymentUrl);
    },
    onError: fail,
  });
  return (
    <BottomSheet visible={visible} onClose={onClose} snaps={[0.5, 0.8]}>
      <SheetScroll>
        <View style={s.head}>
          <View style={[s.icon, { backgroundColor: c.tint }]}><Icon name="message-circle" size={26} tone="accent" /></View>
          <Text variant="h3" center>{t("spf.chatTitle")}</Text>
          <Text variant="small" tone="gray" center>{t("spf.chatLead")}</Text>
        </View>
        <View style={[s.fee, { backgroundColor: c.surface2 }]}>
          <Text variant="small" tone="gray">{t("spf.chatFee")}</Text>
          <Text variant="h3" tone="accent">{fmtUzs(PRIVATE_CHAT_FEE, t)}</Text>
        </View>
        {invoice ? <PaymentPendingCard paymentId={invoice.id} paymentUrl={invoice.url} onPaid={onPaid} /> : <Button title={t("spf.chatPay")} icon="credit-card" variant="gradient" full loading={pay.isPending || opening} onPress={() => pay.mutate()} />}
        <Text variant="caption" tone="gray2" center>{t("spf.chatNote")}</Text>
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  head: { alignItems: "center", gap: 8 },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  fee: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16 },
});
