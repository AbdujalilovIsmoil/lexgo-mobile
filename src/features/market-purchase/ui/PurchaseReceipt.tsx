import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { PurchasePhase } from "../model/phase";
import type { Tracked } from "../model/usePurchase";

type Props = { phase: PurchasePhase; tracked: Tracked; roomId: string; checking: boolean; onCheck: () => void; onOrders: () => void; onChat: () => void; onRetry: () => void; onClose: () => void };
const ICON: Record<PurchasePhase, IconName> = { pending: "clock", paid: "check-circle", chat: "message-circle", completed: "check-circle", cancelled: "x-circle" };

// What happens after "Send request": the status, in words, and the next action.
// The client never marks anything paid; this only reflects what the server reports.
export function PurchaseReceipt({ phase, tracked, roomId, checking, onCheck, onOrders, onChat, onRetry, onClose }: Props) {
  const c = useColors();
  const { t } = useT();
  const tone = phase === "cancelled" ? c.err : phase === "pending" ? c.warn : c.ok;
  const bg = phase === "cancelled" ? c.errBg : phase === "pending" ? c.warnBg : c.okBg;
  const active = tracked.existing && (phase === "pending" || phase === "paid" || phase === "chat");
  return (
    <View style={s.col}>
      <View style={[s.box, { backgroundColor: bg }]}>
        <Icon name={ICON[phase]} size={30} color={tone} />
        <Text variant="h4" center>{t(active ? `mk3.existing.${phase}` : `mk3.phase.${phase}`)}</Text>
        {tracked.workId ? <Text variant="small" weight="bold" tone="accent">{tracked.workId}</Text> : null}
        <Text variant="small" tone="gray" center>{t(`mk3.lead.${phase}`)}</Text>
        {phase === "pending" && !tracked.existing && !tracked.telegramSent ? <Text variant="caption" tone="warn" center>{t("mk3.notDelivered")}</Text> : null}
        {phase === "pending" || phase === "paid" ? <Text variant="caption" tone="gray2" center>{t("mk3.live")}</Text> : null}
      </View>
      {phase === "chat" && roomId ? <Button title={t("mk3.openChat")} onPress={onChat} variant="gradient" icon="message-circle" full /> : null}
      {phase === "cancelled" ? <Button title={t("mk3.retry")} onPress={onRetry} variant="gradient" icon="send" full /> : null}
      {phase === "pending" || phase === "paid" ? <Button title={t("mk3.recheck")} onPress={onCheck} loading={checking} variant="soft" icon="refresh-cw" full /> : null}
      <Button title={t("mk3.toOrders")} onPress={onOrders} variant="line" icon="shopping-bag" full />
      {phase === "cancelled" ? <Button title={t("common.close")} onPress={onClose} variant="ghost" full /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  box: { alignItems: "center", gap: 8, padding: 20, borderRadius: 20 },
});
