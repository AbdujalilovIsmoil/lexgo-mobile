import { StyleSheet, View } from "react-native";
import type { LawyerService } from "@/entities/lawyer";
import { Button, SheetScroll, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import { fmtMoney } from "@/shared/lib/money";
import { usePurchase } from "../model/usePurchase";
import { PurchaseForm } from "./PurchaseForm";
import { PurchaseHead } from "./PurchaseHead";
import { PurchaseReceipt } from "./PurchaseReceipt";
import { PurchaseSteps } from "./PurchaseSteps";

type Props = { lawyerId: string; lawyerName: string; service: LawyerService; blocked: string; onBack: () => void; onOrders: () => void; onChat: (roomId: string) => void; onLogin: () => void; onClose: () => void };

// Buying one service as a checkout: who and what with a close button, the gradient total, the three slim steps, then the form
// (or, after sending, the receipt) and — while the form is open — a bar pinned to the bottom with the total and the one
// send button. POST purchase-request sends no amount: the backend prices it.
export function PurchaseFlow({ lawyerId, lawyerName, service, blocked, onBack, onOrders, onChat, onLogin, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const p = usePurchase(lawyerId, service, onLogin);
  const room = p.found?.canStartChat ? p.found.roomId : "";
  const total = p.tracked?.amount || p.q.quote?.totalPrice || service.price;
  const form = !(p.tracked && p.phase);
  return (
    <View style={s.fill}>
      <SheetScroll>
        <PurchaseHead lawyerName={lawyerName} title={service.title} total={total} onClose={form ? onBack : undefined} />
        <PurchaseSteps phase={p.phase} />
        {p.tracked && p.phase ? (
          <PurchaseReceipt phase={p.phase} tracked={p.tracked} roomId={room} checking={p.checking} onCheck={() => void p.check()} onOrders={onOrders} onChat={() => onChat(room)} onRetry={p.reset} onClose={onClose} />
        ) : (
          <PurchaseForm p={p} blocked={blocked} bare />
        )}
      </SheetScroll>
      {form ? (
        <View style={[s.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <View style={s.sum}>
            <Text variant="caption" tone="gray">{t("ntd.po.total")}</Text>
            <Text variant="h4" tone="accent" numberOfLines={1}>{`${fmtMoney(total)} ${t("common.currency")}`}</Text>
          </View>
          <Button title={p.sending ? t("mk3.sending") : t("mk3.submit")} onPress={() => void p.submit()} loading={p.sending} disabled={!!blocked || !p.q.settled} variant="gradient" icon="send" />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1 },
  sum: { flex: 1 },
});
